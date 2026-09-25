'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { eligibility, fmtDate } from '@/lib/eligibility';
import { disName } from '@/lib/locations';
import { DashShell } from '../page';
import { Card, Badge, Avatar, Toast, Button, EmptyState, Skeleton } from '@/components/ui';
import { FlatIcon } from '@/components/icons';

function normMine(d) {
  return {
    id: d.id, name: d.name, blood_group: d.blood_group,
    division_id: d.division_id, district_id: d.district_id, upazila_id: d.upazila_id,
    available: d.available ?? true, donations: d.donations ?? 0,
    last_donation: d.last_donation || d.last_donation_date || null
  };
}

export default function DonorProfile() {
  const [d, setD] = useState(undefined); // undefined=loading, null=not donor
  const [toast, setToast] = useState('');

  async function load() {
    try {
      const r = await fetch('/api/donors/profile');
      const j = await r.json();
      if (j.ok) { setD(normMine(j.data)); return; }
      if (r.status === 404 || r.status === 401) { setD(null); return; }
      throw new Error();
    } catch {
      const u = store.getUser();
      const mine = store.getDonors().find(x => u && x.name === u.name) || null;
      setD(mine);
    }
  }
  useEffect(() => { ensureSeed(); load(); }, []);

  function save(patch, msg) {
    const all = store.getDonors().map(x => x.id === d.id ? { ...x, ...patch } : x);
    try { localStorage.setItem('bl_donors_v2', JSON.stringify(all)); } catch {}
    setD({ ...d, ...patch });
    if (msg) { setToast(msg); setTimeout(() => setToast(''), 2200); }
  }

  if (d === undefined) return <DashShell title="আমার রক্তদাতা প্রোফাইল"><Skeleton /><p className="text-sm text-gray-400 mt-2">প্রোফাইল লোড হচ্ছে...</p></DashShell>;

  // ডোনার প্রোফাইল নেই → CTA:
  if (d === null) {
    return (
      <DashShell title="আমার রক্তদাতা প্রোফাইল">
        <Card className="text-center py-8">
          <FlatIcon src="donor-hands.png" alt="" className="w-20 h-20 mx-auto mb-3 animate-floaty-sm" />
          <p className="font-extrabold text-lg">আপনি এখনো রক্তদাতা হননি</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">প্রোফাইল বানালে জরুরি সময়ে আপনার কাছে অনুরোধ আসবে।</p>
          <Link href="/become-donor" className="btn-blood !w-auto inline-block">❤️ রক্তদাতা হতে ক্লিক করুন</Link>
        </Card>
      </DashShell>
    );
  }

  const el = eligibility(d.last_donation);
  return (
    <DashShell title="আমার রক্তদাতা প্রোফাইল">
      <Card><div className="flex items-center gap-3"><Avatar name={d.name} />
        <div><p className="font-extrabold text-lg">{d.name}</p><p className="text-blood-700 font-extrabold text-xl">{d.blood_group}</p></div></div>
        <p className="text-sm text-gray-500 mt-1">📍 {disName(d.district_id)}</p>
        <div className="mt-2"><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? '🟢 বর্তমানে উপলভ্য' : '⚪ বর্তমানে উপলভ্য নই'}</Badge></div>
        <p className="text-sm text-gray-600 mt-2">রক্তদান: {d.donations || 0} বার{d.last_donation ? ` • শেষ: ${fmtDate(d.last_donation)}` : ''}</p>
        <button className="btn-outline mt-3 !w-auto !py-2 text-sm" onClick={() => save({ available: !d.available }, d.available ? 'আপনি এখন অনুপলভ্য।' : '✓ আপনি এখন উপলভ্য।')}>অবস্থা পরিবর্তন করুন</button>
      </Card>

      <Card className="mt-3">
        <div className="flex gap-3 items-center">
          <FlatIcon src={el.eligible ? 'blood-badge.png' : 'blood-success.png'} alt="" className="w-14 h-14 shrink-0" />
          <div>
            <p className="font-bold">{el.eligible ? 'আপনি রক্ত দিতে পারেন ❤️' : `পরবর্তী রক্তদান: ${fmtDate(el.nextDate)}`}</p>
            <p className="text-sm text-gray-500">
              {el.neverDonated ? 'এখনো রক্তদানের রেকর্ড নেই।' : el.eligible ? 'শেষ দানের ৪ মাস পূর্ণ হয়েছে।' : `আরও ${el.daysLeft} দিন বিরতি দরকার (সাধারণ নির্দেশিকা)।`}
            </p>
          </div>
        </div>
        <Button disabled={!el.eligible} onClick={() => {
          save({ last_donation: new Date().toISOString().slice(0, 10), donations: (d.donations || 0) + 1, available: false },
            '✓ ধন্যবাদ! রেকর্ড হয়েছে। বিশ্রামের জন্য সাময়িক অনুপলভ্য রাখা হলো।');
          store.pushNotif({ title: '❤️ ধন্যবাদ!', message: 'আপনার রক্তদান রেকর্ড হয়েছে। পরবর্তী উপযুক্ত তারিখে জানিয়ে দেব।', ref: null });
        }} className="mt-3">
          {el.eligible ? 'আজ রক্ত দিয়েছি' : `${el.daysLeft} দিন পর দিতে পারবেন`}
        </Button>
        <p className="text-[11px] text-gray-400 mt-2">⚕️ এটি শুধু সাধারণ নির্দেশিকা — উপযুক্ততার চূড়ান্ত সিদ্ধান্ত চিকিৎসকের।</p>
      </Card>
      <Toast msg={toast} />
    </DashShell>
  );
}
