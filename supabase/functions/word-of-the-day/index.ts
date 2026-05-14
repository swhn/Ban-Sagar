import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FCM_PROJECT_ID = Deno.env.get("FCM_PROJECT_ID")!;
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;
const TOPIC = "word_of_the_day";

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: slangs, error } = await supabase
      .from("slangs")
      .select("id, word, meaning, slug")
      .eq("status", "approved")
      .order("id");

    if (error) throw error;
    if (!slangs?.length) return new Response("no approved slangs", { status: 200 });

    // Deterministic pick: same word for all users on the same UTC day.
    const epochDay = Math.floor(Date.now() / 86_400_000);
    const slang = slangs[epochDay % slangs.length];

    const meaning = slang.meaning.length > 80
      ? slang.meaning.slice(0, 77) + "..."
      : slang.meaning;

    const accessToken = await getFcmAccessToken();

    const fcmRes = await fetch(FCM_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          topic: TOPIC,
          notification: {
            title: `📖 ${slang.word}`,
            body: meaning,
          },
          data: {
            type: "word_of_the_day",
            slug: slang.slug ?? slang.id,
          },
          android: {
            priority: "normal",
            notification: { channel_id: "word_of_the_day" },
          },
        },
      }),
    });

    const body = await fcmRes.json();
    return new Response(JSON.stringify(body), {
      status: fcmRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("word-of-the-day error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

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
    const bytes = typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
    return btoa(String.fromCharCode(...bytes))
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const sigInput = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(claim))}`;
  const pemBody = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const derBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    derBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(sigInput));
  const jwt = `${sigInput}.${b64(sig)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const { access_token } = await tokenRes.json();
  return access_token;
}
