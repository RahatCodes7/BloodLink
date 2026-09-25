'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { fetchRequests } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/constants';
import LocationSelector from '@/components/LocationSelector';
import RequestCard from '@/components/RequestCard';
import { Card, EmptyState, Skeleton } from '@/components/ui';

function SearchBody() {
  const sp = useSearchParams();
  const [bg, setBg] = useState(sp.get('bg') || '');
  const [loc, setLoc] = useState({ division: sp.get('div') || '', district: sp.get('dis') || '', upazila: sp.get('upa') || '' });
  const [sort, setSort] = useState('urgent');
  const [urg, setUrg] = useState('');
  const [all, setAll] = useState(null);

  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try { const rows = await fetchRequests(); if (live) setAll(rows); }
      catch { if (live) setAll(store.getRequests()); }
    })();
    return () => { live = false; };
  }, []);

  const list = useMemo(() => {
    if (!all) return null;
    let r = all.filter(x => x.status === 'ACTIVE');
    if (bg) r = r.filter(x => x.blood_group === bg);
    if (loc.division) r = r.filter(x => x.division_id === loc.division);
    if (loc.district) r = r.filter(x => x.district_id === loc.district);
    if (loc.upazila) r = r.filter(x => x.upazila_id === loc.upazila);
    if (urg) r = r.filter(x => x.urgency === urg);
    const rank = { critical: 0, urgent: 1, normal: 2 };
    r = [...r].sort((a, b) => sort === 'recent' ? new Date(b.created_at) - new Date(a.created_at) : (rank[a.urgency] - rank[b.urgency]));
    return r;
  }, [all, bg, loc, sort, urg]);

  return (
    <div className="pt-4 space-y-4">
      <h1 className="text-2xl font-extrabold">রক্ত খুঁজুন</h1>
      {/* মোবাইলে: গ্রুপ সবসময়, বাকি ফিল্টার collapsible — ফলাফল দ্রুত দেখা যায় */}
      <Card>
        <p className="label">রক্তের গ্রুপ</p>
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
          <button onClick={() => setBg('')} className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full border ${!bg ? 'bg-gray-900 text-white' : 'bg-white'}`}>সবগুলো</button>
          {BLOOD_GROUPS.map(g => <button key={g} onClick={() => setBg(bg === g ? '' : g)} className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full border ${bg === g ? 'bg-blood-600 text-white' : 'bg-white'}`}>{g}</button>)}
        </div>
        <details className="md:hidden group">
          <summary className="text-sm font-bold text-blood-700 cursor-pointer list-none flex items-center gap-1">📍 এলাকা ও অন্যান্য ফিল্টার <span className="group-open:rotate-90 transition">›</span></summary>
          <div className="pt-2">
            <LocationSelector {...loc} onChange={setLoc} />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label className="block"><span className="label">জরুরি অবস্থা</span>
                <select className="input" value={urg} onChange={e => setUrg(e.target.value)}>
                  <option value="">সব</option><option value="normal">🟢 সাধারণ</option><option value="urgent">🟠 জরুরি</option><option value="critical">🔴 অত্যন্ত জরুরি</option>
                </select></label>
              <label className="block"><span className="label">সাজান</span>
                <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="urgent">জরুরি আগে</option><option value="recent">সাম্প্রতিক আগে</option><option value="date">প্রয়োজনের সময় অনুযায়ী</option>
                </select></label>
            </div>
          </div>
        </details>
        <div className="hidden md:block">
          <LocationSelector {...loc} onChange={setLoc} />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <label className="block"><span className="label">জরুরি অবস্থা</span>
              <select className="input" value={urg} onChange={e => setUrg(e.target.value)}>
                <option value="">সব</option><option value="normal">🟢 সাধারণ</option><option value="urgent">🟠 জরুরি</option><option value="critical">🔴 অত্যন্ত জরুরি</option>
              </select></label>
            <label className="block"><span className="label">সাজান</span>
              <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="urgent">জরুরি আগে</option><option value="recent">সাম্প্রতিক আগে</option><option value="date">প্রয়োজনের সময় অনুযায়ী</option>
              </select></label>
          </div>
        </div>
      </Card>
      {!list ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} />)}</div>
      : list.length === 0 ? <EmptyState title="এখন কোনো সক্রিয় রক্তের অনুরোধ পাওয়া যায়নি।" hint="অন্য এলাকা বা রক্তের গ্রুপ দিয়ে আবার চেষ্টা করুন।" />
      : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.map(r => <RequestCard key={r.id} r={r} />)}</div>}
    </div>
  );
}
export default function SearchPage() { return <Suspense><SearchBody /></Suspense>; }
