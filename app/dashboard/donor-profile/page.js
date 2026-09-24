'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { eligibility, fmtDate } from '@/lib/eligibility';
import { DashShell } from '../page';
import { Card, Badge, Avatar, Toast, Button } from '@/components/ui';
import { FlatIcon } from '@/components/icons';

export default function DonorProfile() {
  const [d, setD] = useState(null);
  const [toast, setToast] = useState('');
  useEffect(() => { ensureSeed(); const u = store.getUser(); const mine = store.getDonors().find(x => x.name === u?.name) || store.getDonors()[0]; setD(mine); }, []);
  function save(patch, msg) {
    const all = store.getDonors().map(x => x.id === d.id ? { ...x, ...patch } : x);
    localStorage.setItem('bl_donors', JSON.stringify(all));
    setD({ ...d, ...patch });
    if (msg) { setToast(msg); setTimeout(() => setToast(''), 2200); }
  }
  if (!d) return <DashShell title="আমার রক্তদাতা প্রোফাইল"><p>প্রোফাইল লোড হচ্ছে...</p></DashShell>;
  const el = eligibility(d.last_donation);
  return (
    <DashShell title="আমার রক্তদাতা প্রোফাইল">
      <Card><div className="flex items-center gap-3"><Avatar name={d.name} />
        <div><p className="font-extrabold text-lg">{d.name}</p><p className="text-blood-700 font-extrabold text-xl">{d.blood_group}</p></div></div>
        <div className="mt-2"><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? '🟢 বর্তমানে উপলভ্য' : '⚪ বর্তমানে উপলভ্য নই'}</Badge></div>
        <p className="text-sm text-gray-600 mt-2">রক্তদান: {d.donations || 0} বার{d.last_donation ? ` • শেষ: ${fmtDate(d.last_donation)}` : ''}</p>
        <button className="btn-outline mt-3 !w-auto !py-2 text-sm" onClick={() => save({ available: !d.available }, d.available ? 'আপনি এখন অনুপলভ্য।' : '✓ আপনি এখন উপলভ্য।')}>অবস্থা পরিবর্তন করুন</button>
      </Card>

      {/* রিমাইন্ডার কার্ড */}
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
        <Button
          disabled={!el.eligible}
          onClick={() => {
            save({ last_donation: new Date().toISOString().slice(0, 10), donations: (d.donations || 0) + 1, available: false },
              '✓ ধন্যবাদ! রেকর্ড হয়েছে। বিশ্রামের জন্য সাময়িক অনুপলভ্য রাখা হলো।');
            store.pushNotif({ title: '❤️ ধন্যবাদ!', message: 'আপনার রক্তদান রেকর্ড হয়েছে। পরবর্তী উপযুক্ত তারিখে জানিয়ে দেব।', ref: null });
          }}
          className="mt-3">
          {el.eligible ? 'আজ রক্ত দিয়েছি' : `${el.daysLeft} দিন পর দিতে পারবেন`}
        </Button>
        <p className="text-[11px] text-gray-400 mt-2">⚕️ এটি শুধু সাধারণ নির্দেশিকা — উপযুক্ততার চূড়ান্ত সিদ্ধান্ত চিকিৎসকের।</p>
      </Card>
      <Toast msg={toast} />
    </DashShell>
  );
}
