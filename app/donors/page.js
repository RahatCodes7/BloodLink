'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { fetchDonors } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/constants';
import LocationSelector from '@/components/LocationSelector';
import DonorCard from '@/components/DonorCard';
import { Card, EmptyState, Skeleton } from '@/components/ui';

export default function Donors() {
  const [bg, setBg] = useState('');
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' });
  const [onlyAvail, setOnlyAvail] = useState(true);
  const [all, setAll] = useState(null);
  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try { const rows = await fetchDonors(); if (live) setAll(rows); }
      catch { if (live) setAll(store.getDonors()); }
    })();
    return () => { live = false; };
  }, []);
  const list = (all || []).filter(d => (!bg || d.blood_group === bg) && (!loc.district || d.district_id === loc.district) && (!onlyAvail || d.available));
  return (
    <div className="pt-4 space-y-4">
      <h1 className="text-2xl font-extrabold">রক্তদাতা খুঁজুন</h1>
      <Link href="/compatibility" className="block bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-2xl p-3.5 card-hover">
        <p className="font-bold text-sm">🩸 কে কাকে রক্ত দিতে পারে?</p>
        <p className="text-xs text-gray-500">সামঞ্জস্য চার্ট দেখুন → (শিক্ষামূলক)</p>
      </Link>
      <Card>
        <p className="label">রক্তের গ্রুপ</p>
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
          <button onClick={() => setBg('')} className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full border ${!bg ? 'bg-gray-900 text-white' : 'bg-white'}`}>সব</button>
          {BLOOD_GROUPS.map(g => <button key={g} onClick={() => setBg(bg === g ? '' : g)} className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full border ${bg === g ? 'bg-blood-600 text-white' : 'bg-white'}`}>{g}</button>)}
        </div>
        <details className="md:hidden group">
          <summary className="text-sm font-bold text-blood-700 cursor-pointer list-none flex items-center gap-1">📍 এলাকা বেছে নিন <span className="group-open:rotate-90 transition">›</span></summary>
          <div className="pt-2">
            <LocationSelector {...loc} onChange={setLoc} />
          </div>
        </details>
        <div className="hidden md:block"><LocationSelector {...loc} onChange={setLoc} /></div>
        <label className="flex items-center gap-2 text-sm font-bold mt-1"><input type="checkbox" checked={onlyAvail} onChange={e => setOnlyAvail(e.target.checked)} className="w-5 h-5 accent-red-600" />শুধু উপলভ্য দাতা</label>
      </Card>
      {!all ? <div className="grid sm:grid-cols-2 gap-3">{[1, 2].map(i => <Skeleton key={i} />)}</div>
      : list.length === 0 ? <EmptyState title="কোনো রক্তদাতা পাওয়া যায়নি।" hint="অন্য গ্রুপ বা এলাকা দিয়ে চেষ্টা করুন।" />
      : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.map(d => <DonorCard key={d.id} d={d} />)}</div>}
      <p className="text-xs text-gray-400">⚕️ BloodLink চিকিৎসাগত উপযুক্ততা নির্ধারণ করে না — সিদ্ধান্ত চিকিৎসকের।</p>
    </div>
  );
}
