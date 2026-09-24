'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { disName } from '@/lib/locations';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { FlatIcon } from '@/components/icons';
import Reveal from '@/components/Reveal';

export default function Campaigns() {
  const [list, setList] = useState(null);
  useEffect(() => { ensureSeed(); const t = setTimeout(() => setList(store.getCampaigns()), 350); return () => clearTimeout(t); }, []);
  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">রক্তদান ক্যাম্পেইন</h1>
        <Link href="/campaigns/new" className="btn-blood !w-auto !py-2 text-sm">+ নতুন ক্যাম্পেইন</Link>
      </div>
      {!list ? <div className="grid sm:grid-cols-2 gap-3">{[1, 2].map(i => <Skeleton key={i} />)}</div>
      : list.length === 0 ? <EmptyState title="এখন কোনো ক্যাম্পেইন নেই।" hint="নতুন ক্যাম্পেইন যোগ করে জানিয়ে দিন।" icon="blood-trio.png" />
      : <div className="grid sm:grid-cols-2 gap-3">{list.map((c, i) => (
        <Reveal key={c.id} delay={Math.min(i, 4) * 80}>
          <Card className="card-hover">
            <div className="flex gap-3">
              <FlatIcon src="blood-trio.png" alt="" className="w-14 h-14 shrink-0" />
              <div>
                <p className="font-bold leading-snug">{c.title}</p>
                <p className="text-sm text-gray-500">{c.organizer_name}</p>
                <p className="text-sm text-gray-600 mt-1">📍 {c.venue}, {disName(c.district_id)} • 📅 {c.event_date}{c.start_time ? ` • ${c.start_time}` : ''}</p>
              </div>
            </div>
            <Link href={`/campaigns/${c.id}`} className="btn-outline w-full text-center mt-3 !py-2">বিস্তারিত</Link>
          </Card>
        </Reveal>))}
      </div>}
    </div>
  );
}
