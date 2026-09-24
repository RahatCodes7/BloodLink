'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { BLOOD_GROUPS } from '@/lib/constants';
import LocationSelector from '@/components/LocationSelector';
import DonorCard from '@/components/DonorCard';
import { Card, EmptyState, Skeleton } from '@/components/ui';

export default function Donors() {
  const [bg, setBg] = useState('');
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' });
  const [onlyAvail, setOnlyAvail] = useState(true);
  const [all, setAll] = useState(null);
  useEffect(() => { ensureSeed(); const t = setTimeout(() => setAll(store.getDonors()), 350); return () => clearTimeout(t); }, []);
  const list = (all || []).filter(d => (!bg || d.blood_group === bg) && (!loc.district || d.district_id === loc.district) && (!onlyAvail || d.available));
  return (
    <div className="pt-4 space-y-4">
      <h1 className="text-2xl font-extrabold">রক্তদাতা খুঁজুন</h1>
      <Card>
        <p className="label">রক্তের গ্রুপ</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button onClick={() => setBg('')} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${!bg ? 'bg-gray-900 text-white' : 'bg-white'}`}>সব</button>
          {BLOOD_GROUPS.map(g => <button key={g} onClick={() => setBg(bg === g ? '' : g)} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${bg === g ? 'bg-blood-600 text-white' : 'bg-white'}`}>{g}</button>)}
        </div>
        <LocationSelector {...loc} onChange={setLoc} />
        <label className="flex items-center gap-2 text-sm font-bold mt-1"><input type="checkbox" checked={onlyAvail} onChange={e => setOnlyAvail(e.target.checked)} className="w-5 h-5 accent-red-600" />শুধু উপলভ্য দাতা</label>
      </Card>
      {!all ? <div className="grid sm:grid-cols-2 gap-3">{[1, 2].map(i => <Skeleton key={i} />)}</div>
      : list.length === 0 ? <EmptyState title="কোনো রক্তদাতা পাওয়া যায়নি।" hint="অন্য গ্রুপ বা এলাকা দিয়ে চেষ্টা করুন।" />
      : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.map(d => <DonorCard key={d.id} d={d} />)}</div>}
      <p className="text-xs text-gray-400">⚕️ BloodLink চিকিৎসাগত উপযুক্ততা নির্ধারণ করে না — সিদ্ধান্ত চিকিৎসকের।</p>
    </div>
  );
}
