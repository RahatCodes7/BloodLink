// BloodLink service worker — offline fallback + Web Push (জরুরি রক্তের নোটিফিকেশন)
const CACHE = 'bloodlink-v1';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(fetch(request).catch(() => new Response('অফলাইনে আছেন। জরুরি অনুরোধ দেখতে ইন্টারনেট সংযোগ দিন।', { headers: { 'Content-Type': 'text/plain;charset=utf-8' } })));
});

// জরুরি push এলে বাংলায় নোটিফিকেশন:
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch {}
  const title = d.title || '🩸 BloodLink — জরুরি রক্ত প্রয়োজন';
  const body = d.body || 'আপনার এলাকায় রক্তের অনুরোধ এসেছে। দেখুন।';
  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icons/blood-hero.png',
    badge: '/icons/blood-badge.png',
    tag: 'bloodlink-urgent',
    renotify: true,
    requireInteraction: true,
    data: { url: d.url || '/' }
  }));
});

// নোটিফিকেশনে ট্যাপ → অনুরোধের পেজ খুলবে:
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((wins) => {
    for (const w of wins) { if (w.url.includes(self.location.origin)) { w.navigate(url); return w.focus(); } }
    return self.clients.openWindow(url);
  }));
});
