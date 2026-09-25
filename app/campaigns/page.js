'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { fetchCampaigns } from '@/lib/api';
import { disName } from '@/lib/locations';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import Reveal from '@/components/Reveal';

export default function Campaigns() {
  const [list, setList] = useState(null);
  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try { const rows = await fetchCampaigns(); if (live) setList(rows); }
      catch { if (live) setList(store.getCampaigns()); }
    })();
    return () => { live = false; };
  }, []);
  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">রক্তদান ক্যাম্পেইন</h1>
        <Link href="/campaigns/new" className="btn-blood !w-auto !py-2 text-sm">+ নতুন ক্যাম্পেইন</Link>
      </div>
      {!list ? <div className="grid sm:grid-cols-2 gap-3">{[1, 2].map(i => <Skeleton key={i} />)}</div>
      : list.length === 0 ? <EmptyState title="এখন কোনো ক্যাম্পেইন নেই।" hint="নতুন ক্যাম্পেইন যোগ করে জানিয়ে দিন।" icon="blood-trio.png" />
      : <div className="grid sm:grid-cols-2 gap-3">{list.map((c, i) => {
        const daysLeft = Math.ceil((new Date(c.event_date) - new Date(new Date().toDateString())) / 86400000);
        const d = new Date(c.event_date);
        const day = isNaN(d) ? '•' : d.getDate().toLocaleString('bn-BD');
        const month = isNaN(d) ? '' : d.toLocaleDateString('bn-BD', { month: 'short' });
        return (
        <Reveal key={c.id} delay={Math.min(i, 4) * 80}>
          <Card className="card-hover !p-0 overflow-hidden">
            <div className="flex">
              <div className="w-[76px] shrink-0 bg-gradient-to-b from-blood-600 to-blood-800 text-white flex flex-col items-center justify-center py-4 gap-0.5">
                <span className="text-2xl font-extrabold tabular-nums leading-none">{day}</span>
                <span className="text-xs font-bold opacity-90">{month}</span>
                <span className="mt-1.5 text-[10px] font-bold bg-white/20 rounded-full px-2 py-0.5 whitespace-nowrap">
                  {daysLeft < 0 ? 'শেষ' : daysLeft === 0 ? 'আজ' : `${daysLeft.toLocaleString('bn-BD')} দিন বাকি`}
                </span>
              </div>
              <div className="p-3.5 flex-1 min-w-0">
                <p className="font-bold leading-snug">📣 {c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">আয়োজনে: {c.organizer_name}</p>
                <p className="text-[13px] text-gray-600 mt-1.5">📍 {c.venue}, {disName(c.district_id)}</p>
                <p className="text-[13px] text-gray-600">🕘 {c.event_date}{c.start_time ? ` • ${c.start_time}` : ''}</p>
              </div>
            </div>
            <Link href={`/campaigns/${c.id}`} className="flex items-center justify-center gap-1 bg-red-50 hover:bg-blood-600 hover:text-white text-blood-700 font-bold text-sm py-2.5 transition">বিস্তারিত দেখুন →</Link>
          </Card>
        </Reveal>);
      })}
      </div>}
    </div>
  );
}
