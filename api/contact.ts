import { Resend } from 'resend';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, email, subject, message, recaptchaToken } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      if (!recaptchaToken) {
        return new Response(JSON.stringify({ error: 'reCAPTCHA verification required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(recaptchaToken)}`,
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success || captchaData.score < 0.5) {
        return new Response(JSON.stringify({ error: 'reCAPTCHA verification failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const resend = new Resend(apiKey);
    const toEmail = process.env.CONTACT_EMAIL || 'ban-sagar@madebysai.com';

    await resend.emails.send({
      from: 'Ban Sagar <noreply@bansagar.com>',
      to: [toEmail],
      replyTo: email,
      subject: `[Ban Sagar Contact] ${subject || 'New message'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #4f46e5;">New Contact Message</h2>
          <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
          ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ''}
          <hr style="border: 1px solid #e5e7eb;" />
          <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</div>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
