'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { eligibility } from '@/lib/eligibility';
import { Card, Avatar } from '@/components/ui';

const side = [['/dashboard', '🏠 ড্যাশবোর্ড'], ['/dashboard/requests', '🩸 অনুরোধ'], ['/dashboard/donor-profile', '❤️ রক্তদাতা'], ['/dashboard/saved', '🔖 সংরক্ষিত'], ['/dashboard/notifications', '🔔 নোটিফাই'], ['/dashboard/messages', '💬 মেসেজ'], ['/dashboard/profile', '👤 প্রোফাইল']];

export function DashShell({ children, title }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => { ensureSeed(); const u = store.getUser(); if (!u) router.push('/login'); else setUser(u); }, [router]);
  if (!user) return <div className="pt-8">প্রোফাইল লোড হচ্ছে...</div>;
  return (
    <div className="pt-4 md:grid md:grid-cols-[220px_1fr] md:gap-4">
      <aside className="hidden md:block"><Card><p className="font-extrabold text-blood-700 mb-2">🩸 BloodLink</p>
        <nav className="flex flex-col gap-1">{side.map(([h, l]) => <Link key={h} href={h} className="rounded-xl px-3 py-2 font-semibold hover:bg-blood-50">{l}</Link>)}</nav></Card></aside>
      <div><h1 className="text-xl font-extrabold mb-3">{title}</h1>{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ active: 0, saved: 0, notif: 0 });
  const [reminder, setReminder] = useState(false);
  const router = useRouter();
  useEffect(() => {
    ensureSeed();
    const u = store.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    const mine = store.getDonors().find(x => x.name === u?.name);
    if (mine && eligibility(mine.last_donation).eligible && mine.available) setReminder(true);
    setStats({ active: store.getRequests().filter(r => r.status === 'ACTIVE').length, saved: store.getSaved().length, notif: store.getNotif().filter(n => !n.is_read).length });
  }, [router]);
  if (!user) return <div className="pt-8">প্রোফাইল লোড হচ্ছে...</div>;
  return (
    <DashShell title={`স্বাগতম, ${user.name} 👋`}>
      {reminder && (
        <Link href="/dashboard/donor-profile" className="block mb-3 bg-gradient-to-r from-red-50 to-green-50 border border-red-100 rounded-2xl p-3.5 animate-pop-in">
          <p className="font-bold text-sm">❤️ সুখবর! আপনি এখন রক্ত দিতে পারেন</p>
          <p className="text-xs text-gray-500">শেষ দানের ৪ মাস পূর্ণ হয়েছে। বিস্তারিত দেখুন →</p>
        </Link>
      )}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[['আমার সক্রিয় অনুরোধ', stats.active], ['সংরক্ষিত অনুরোধ', stats.saved], ['নোটিফিকেশন', stats.notif]].map(([l, v]) => (
          <Card key={l} className="text-center"><p className="text-2xl font-extrabold text-blood-700">{v}</p><p className="text-xs font-bold text-gray-500">{l}</p></Card>))}
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <Link href="/request-new" className="btn-blood text-center">🩸 রক্তের অনুরোধ করুন</Link>
        <Link href="/dashboard/donor-profile" className="btn-outline text-center">❤️ রক্তদাতা প্রোফাইল</Link>
        <Link href="/search" className="btn-outline text-center">🔎 রক্ত খুঁজুন</Link>
        <Link href="/campaigns" className="btn-outline text-center sm:col-span-3">📣 রক্তদান ক্যাম্পেইন দেখুন</Link>
      </div>
      <button className="mt-4 text-sm text-gray-500 underline" onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {} store.logout(); router.push('/'); }}>লগআউট</button>
    </DashShell>
  );
}
