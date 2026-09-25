'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { fetchRequests } from '@/lib/api';
import RequestCard from '@/components/RequestCard';
import { EmptyState, Skeleton } from '@/components/ui';

// সকল আবেদন — পুরনো (দীর্ঘ অপেক্ষা) আগে, toggle-এ সাম্প্রতিক
export default function AllRequests() {
  const [all, setAll] = useState(null);
  const [sort, setSort] = useState('oldest');
  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try { const rows = await fetchRequests({ limit: 50 }); if (live) setAll(rows); }
      catch { if (live) setAll(store.getRequests()); }
    })();
    return () => { live = false; };
  }, []);
  const list = useMemo(() => {
    if (!all) return null;
    const r = all.filter(x => x.status === 'ACTIVE');
    return [...r].sort((a, b) => sort === 'oldest'
      ? new Date(a.created_at) - new Date(b.created_at)
      : new Date(b.created_at) - new Date(a.created_at));
  }, [all, sort]);

  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">সকল আবেদন</h1>
        <div className="flex gap-1.5">
          <button onClick={() => setSort('oldest')} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${sort === 'oldest' ? 'bg-gray-900 text-white' : 'bg-white'}`}>পুরনো আগে</button>
          <button onClick={() => setSort('recent')} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${sort === 'recent' ? 'bg-gray-900 text-white' : 'bg-white'}`}>সাম্প্রতিক</button>
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-2">দীর্ঘক্ষণ অপেক্ষায় থাকা আবেদন আগে দেখানো হয় • মেয়াদ ৩ দিন</p>
      {!list ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} />)}</div>
      : list.length === 0 ? <EmptyState title="এখন কোনো সক্রিয় আবেদন নেই।" hint="নতুন অনুরোধ এলে এখানে দেখা যাবে।" />
      : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.map(r => <RequestCard key={r.id} r={r} />)}</div>}
      <p className="text-center"><Link href="/search" className="text-sm font-bold text-blood-700">🔎 ফিল্টার দিয়ে খুঁজুন →</Link></p>
    </div>
  );
}
