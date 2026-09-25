'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, EmptyState } from './ui';
import { FlatIcon } from './icons';

const ALLOWED = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

// /admin-এর গেট — ADMIN/MODERATOR role ছাড়া ঢুকতে পারবে না
export default function AdminGate({ children }) {
  const [st, setSt] = useState('loading');
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        const j = await r.json();
        if (!j.ok) { setSt('login'); return; }
        setSt(ALLOWED.includes(j.data.role) ? 'ok' : 'denied');
      } catch { setSt('login'); }
    })();
  }, []);
  if (st === 'loading') return <div className="pt-8 text-sm text-gray-400">যাচাই হচ্ছে...</div>;
  if (st === 'login') {
    return <div className="pt-8"><Card className="text-center max-w-sm mx-auto">
      <FlatIcon src="blood-badge.png" alt="" className="w-16 h-16 mx-auto mb-2" />
      <p className="font-extrabold">লগইন প্রয়োজন</p>
      <p className="text-sm text-gray-500 mb-3">অ্যাডমিন প্যানেলে যেতে লগইন করুন।</p>
      <Link href="/login" className="btn-blood !w-auto inline-block">লগইন</Link>
    </Card></div>;
  }
  if (st === 'denied') {
    return <div className="pt-8"><Card className="text-center max-w-sm mx-auto">
      <p className="text-4xl mb-2">🛡️</p>
      <p className="font-extrabold">অনুমতি নেই</p>
      <p className="text-sm text-gray-500 mb-3">এই পেজ শুধু মডারেটর/অ্যাডমিনদের জন্য।</p>
      <Link href="/" className="btn-outline !w-auto inline-block">হোমে ফিরুন</Link>
    </Card></div>;
  }
  return children;
}
