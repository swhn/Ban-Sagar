import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FCM_PROJECT_ID = Deno.env.get("FCM_PROJECT_ID")!;
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    // Only handle UPDATE events on the slangs table
    if (type !== "UPDATE" || table !== "slangs") return ok();

    // Only notify when status actually changes to approved or rejected
    if (!old_record || record.status === old_record.status) return ok();
    if (record.status !== "approved" && record.status !== "rejected") return ok();

    const authorId = record.author_id;
    if (!authorId) return ok();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: user } = await supabase
      .from("users")
      .select("fcm_token, notify_approved")
      .eq("id", authorId)
      .single();

    if (!user?.fcm_token || !user.notify_approved) return ok();

    const isApproved = record.status === "approved";
    const word = record.word ?? "Your word";

    const accessToken = await getFcmAccessToken();

    const fcmRes = await fetch(FCM_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: user.fcm_token,
          notification: {
            title: isApproved ? "✅ Word Approved!" : "Submission Update",
            body: isApproved
              ? `“${word}” is now live on Ban Sagar!`
              : `“${word}” was not approved this time.`,
          },
          data: {
            type: "submission_status",
            slang_id: String(record.id),
            slug: record.slug ?? "",
            status: record.status,
          },
          android: { priority: "high" },
        },
      }),
    });

    const body = await fcmRes.json();
    return new Response(JSON.stringify(body), {
      status: fcmRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

function ok() {
  return new Response("ok", { status: 200 });
}

async function getFcmAccessToken(): Promise<string> {
  const sa = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")!);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const b64 = (data: string | ArrayBuffer) => {
    const bytes =
      typeof data === "string"
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);
    return btoa(String.fromCharCode(...bytes))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const headerB64 = b64(JSON.stringify(header));
  const claimB64 = b64(JSON.stringify(claim));
  const sigInput = `${headerB64}.${claimB64}`;

  const pemBody = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const derBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    derBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(sigInput),
  );

  const jwt = `${sigInput}.${b64(sig)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const { access_token } = await tokenRes.json();
  return access_token;
}
