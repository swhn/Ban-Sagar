import { Resend } from 'resend';

export const config = {
  runtime: 'edge',
};

type NotificationType =
  | 'admin_login'
  | 'contribution_approved'
  | 'badge_unlocked';

interface NotifyRequest {
  type: NotificationType;
  to: string;
  data: Record<string, string>;
}

const TEMPLATES: Record<NotificationType, { subject: (d: Record<string, string>) => string; body: (d: Record<string, string>) => string }> = {
  admin_login: {
    subject: (d) => `[Ban Sagar] User login: ${d.userName}`,
    body: (d) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">User Login Notification</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; margin: 0 0 16px 0;"><strong>${escapeHtml(d.userName)}</strong> just logged in.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #111827; font-size: 14px;">${escapeHtml(d.userEmail)}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #111827; font-size: 14px;">${escapeHtml(d.time)}</td></tr>
          </table>
        </div>
      </div>
    `,
  },
  contribution_approved: {
    subject: (d) => `[Ban Sagar] Your word "${d.word}" was approved!`,
    body: (d) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Contribution Approved!</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; margin: 0 0 12px 0;">Great news! Your slang word <strong>"${escapeHtml(d.word)}"</strong> has been approved and is now live on Ban Sagar.</p>
          <a href="https://bansagar.com/slang/${escapeHtml(d.slug)}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Your Word</a>
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">You can manage your notification preferences in your <a href="https://bansagar.com/profile" style="color: #6366f1;">profile settings</a>.</p>
        </div>
      </div>
    `,
  },
  badge_unlocked: {
    subject: (d) => `[Ban Sagar] Badge unlocked: ${d.badgeTitle}!`,
    body: (d) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Badge Unlocked!</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="text-align: center; padding: 16px 0;">
            <p style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">${escapeHtml(d.badgeTitle)}</p>
            <p style="color: #6b7280; margin: 8px 0 0 0;">${escapeHtml(d.badgeDescription)}</p>
            <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${escapeHtml(d.badgeTier)}</span>
          </div>
          <p style="color: #374151; margin: 16px 0 0 0; text-align: center;">Keep contributing to unlock more badges!</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0; text-align: center;">Manage notifications in your <a href="https://bansagar.com/profile" style="color: #6366f1;">profile settings</a>.</p>
        </div>
      </div>
    `,
  },
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
    const { type, to, data } = (await req.json()) as NotifyRequest;

    if (!type || !to || !TEMPLATES[type]) {
      return new Response(JSON.stringify({ error: 'Invalid notification type or recipient' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const template = TEMPLATES[type];
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'Ban Sagar <noreply@bansagar.com>',
      to: [to],
      subject: template.subject(data),
      html: template.body(data),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
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
