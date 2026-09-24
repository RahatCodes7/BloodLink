const CACHE = 'bloodlink-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(fetch(request).catch(() => new Response('অফলাইনে আছেন। জরুরি অনুরোধ দেখতে ইন্টারনেট সংযোগ দিন।', { headers: { 'Content-Type': 'text/plain;charset=utf-8' } })));
});
