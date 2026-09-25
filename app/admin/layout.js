'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { Card } from '@/components/ui';

const links = [['/admin', '📊 ড্যাশবোর্ড'], ['/admin/users', '👥 ব্যবহারকারী'], ['/admin/requests', '🩸 রক্তের অনুরোধ'], ['/admin/donors', '❤️ রক্তদাতা'], ['/admin/reports', '⚠️ রিপোর্ট'], ['/admin/hospitals', '🏥 হাসপাতাল'], ['/admin/locations', '📍 লোকেশন'], ['/admin/notifications', '🔔 নোটিফিকেশন'], ['/admin/settings', '⚙️ সেটিংস']];

function Shell({ children, title }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { ensureSeed(); setOk(true); }, []);
  if (!ok) return <div className="pt-8">লোড হচ্ছে...</div>;
  return (
    <div className="pt-4 md:grid md:grid-cols-[220px_1fr] md:gap-4">
      <aside className="hidden md:block"><Card><p className="font-extrabold mb-2">🛡️ অ্যাডমিন</p>
        <nav className="flex flex-col gap-1">{links.map(([h, l]) => <Link key={h} href={h} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-red-50">{l}</Link>)}</nav></Card></aside>
      <div><h1 className="text-xl font-extrabold mb-3">{title}</h1>
        <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 mb-1">{links.map(([h, l]) => <Link key={h} href={h} className="text-xs font-bold bg-white border rounded-full px-3 py-1.5 whitespace-nowrap">{l}</Link>)}</div>
        {children}</div>
    </div>
  );
}
export default Shell;

export function AdminStats() {
  const [s, setS] = useState(null);
  useEffect(() => {
    ensureSeed();
    (async () => {
      // আসল DB সংখ্যা (ব্যর্থ হলে local fallback):
      let reqs = null, donors = null;
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/blood-requests?limit=50').then(r => r.json()),
          fetch('/api/donors?limit=50').then(r => r.json())
        ]);
        if (r1.ok) reqs = r1.data; if (r2.ok) donors = r2.data;
      } catch {}
      reqs = reqs || store.getRequests();
      donors = donors || store.getDonors();
      const owners = new Set(reqs.map(r => r.requester_id).filter(Boolean));
      setS({
        today: reqs.length, active: reqs.filter(r => r.status === 'ACTIVE').length,
        fulfilled: reqs.filter(r => r.status === 'FULFILLED').length, review: reqs.filter(r => r.status === 'PENDING_REVIEW').length,
        users: owners.size, donors: donors.length, reports: store.getReports().length
      });
    })();
  }, []);
  if (!s) return null;
  const cards = [['আজকের অনুরোধ', s.today], ['সক্রিয় অনুরোধ', s.active], ['আজ পূরণ হয়েছে', s.fulfilled], ['পর্যালোচনায়', s.review], ['মোট ব্যবহারকারী', s.users], ['মোট রক্তদাতা', s.donors], ['রিপোর্ট', s.reports]];
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{cards.map(([l, v]) => <Card key={l} className="text-center"><p className="text-2xl font-extrabold text-blood-700">{v}</p><p className="text-xs font-bold text-gray-500">{l}</p></Card>)}</div>;
}
