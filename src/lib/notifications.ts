type NotificationType = 'admin_login' | 'contribution_approved' | 'badge_unlocked';

export function sendNotification(type: NotificationType, to: string, data: Record<string, string>) {
  fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, to, data }),
  }).catch(() => {});
}
