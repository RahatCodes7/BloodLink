'use client';
// Web Push client — SW register + permission + subscribe → /api/push/subscribe

function urlBase64ToUint8Array(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushPermission() {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export async function ensureSW() {
  // register + active হওয়া পর্যন্ত অপেক্ষা (নইলে "no active Service Worker" error)
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

/** Permission চাওয়া + subscribe + server-এ পাঠানো। */
export async function enablePush() {
  if (!pushSupported()) throw new Error('এই ব্রাউজারে push সাপোর্ট নেই।');
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!pub) throw new Error('Push সার্ভার কনফিগার হয়নি।');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('নোটিফিকেশন অনুমতি দেননি।');
  const reg = await ensureSW();
  let sub;
  try {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pub)
    });
  } catch (e) {
    throw new Error('সার্ভিস ওয়ার্কার চালু হয়নি — পেজ রিফ্রেশ (Ctrl+Shift+R) করে আবার দিন।');
  }
  const j = sub.toJSON();
  const r = await fetch('/api/push/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth })
  });
  const out = await r.json();
  if (!out.ok) throw new Error(out.error || 'সাবস্ক্রাইব ব্যর্থ');
  try { localStorage.setItem('bl_push_on', '1'); } catch {}
  return true;
}

export function wasPushEnabled() {
  try { return localStorage.getItem('bl_push_on') === '1'; } catch { return false; }
}
export function dismissPushPrompt() {
  try { localStorage.setItem('bl_push_off', Date.now().toString()); } catch {}
}
export function pushPromptSnoozed() {
  try {
    const t = Number(localStorage.getItem('bl_push_off') || 0);
    return Date.now() - t < 7 * 24 * 3600 * 1000; // ৭ দিন snooze
  } catch { return false; }
}
