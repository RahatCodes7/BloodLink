// Service: web push broadcast (VAPID) — জরুরি অনুরোধ সবার ফোনে।
const webpush = require('web-push');
const { query } = require('../lib/db/client');

function configured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function setup() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@bloodlink.local',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/** সব subscriber-কে push (410/gone হলে cleanup)। concurrency সীমিত। */
async function broadcast({ title, body, url }) {
  if (!configured()) return { sent: 0, skipped: 'vapid-missing' };
  setup();
  const payload = JSON.stringify({ title, body, url: url || '/' });
  let sent = 0, removed = 0;
  let offset = 0;
  for (;;) {
    const r = await query('SELECT id, endpoint, p256dh, auth FROM push_subscriptions ORDER BY created_at LIMIT 100 OFFSET $1', [offset]);
    if (!r.rows.length) break;
    await Promise.all(r.rows.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          await query('DELETE FROM push_subscriptions WHERE id=$1', [s.id]).catch(() => {});
          removed++;
        }
      }
    }));
    offset += r.rows.length;
  }
  return { sent, removed };
}

async function saveSubscription({ userId, endpoint, p256dh, auth }) {
  const r = await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ($1,$2,$3,$4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id=EXCLUDED.user_id RETURNING id`,
    [userId || null, endpoint, p256dh, auth]);
  return r.rows[0];
}

async function removeSubscription(endpoint) {
  const r = await query('DELETE FROM push_subscriptions WHERE endpoint=$1', [endpoint]);
  return r.rowCount > 0;
}

module.exports = { configured, broadcast, saveSubscription, removeSubscription };
