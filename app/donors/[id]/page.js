'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { divName, disName, upaName } from '@/lib/locations';
import { telLink, waLink } from '@/lib/utils';
import { fmtDate } from '@/lib/eligibility';
import { Card, Badge, Avatar, Toast, EmptyState } from '@/components/ui';
import { FlatIcon } from '@/components/icons';
import { Spinner } from '@/components/icons';

export default function DonorDetails() {
  const { id } = useParams();
  const [d, setD] = useState(undefined);
  const [contact, setContact] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await fetch(`/api/donors/${id}`);
        const j = await r.json();
        if (live) setD(j.ok ? j.data : null);
      } catch { if (live) setD(null); }
    })();
    return () => { live = false; };
  }, [id]);

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }

  async function reveal() {
    setBusy(true);
    try {
      const r = await fetch(`/api/donors/${id}/contact`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'যোগাযোগ করা যায়নি');
      setContact(j.data.phone);
    } catch (e) { say(e.message); }
    setBusy(false);
  }

  if (d === undefined) return <div className="pt-6 text-sm text-gray-400">লোড হচ্ছে...</div>;
  if (d === null) return <div className="pt-6"><EmptyState title="ডোনার পাওয়া যায়নি।" icon="donor-hands.png" /></div>;

  return (
    <div className="pt-4 max-w-xl mx-auto space-y-4">
      <Card className="text-center">
        <Avatar name={d.name} />
        <p className="font-extrabold text-xl mt-2">❤️ {d.name}</p>
        <p className="text-blood-700 font-extrabold text-4xl mt-1">{d.blood_group}</p>
        <div className="mt-2 flex justify-center"><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? '🟢 বর্তমানে উপলভ্য' : '⚪ বর্তমানে উপলভ্য নই'}</Badge></div>
        <p className="text-sm text-gray-500 mt-2">📍 {divName(d.division_id)}, {disName(d.district_id)}{d.upazila_id ? `, ${upaName(d.upazila_id)}` : ''}</p>
        <p className="text-sm text-gray-600 mt-1">রক্তদান: {d.donations || 0} বার{d.last_donation ? ` • শেষ: ${fmtDate(d.last_donation)}` : ''}</p>
        {d.verified && <p className="text-xs font-bold text-green-700 mt-1">✓ যাচাইকৃত ডোনার</p>}
      </Card>

      <Card>
        <p className="font-bold mb-2">যোগাযোগ</p>
        {!contact ? (
          <>
            <p className="text-xs text-gray-500 mb-2">নম্বর দেখতে লগইন করুন। অপব্যবহার করলে অ্যাকাউন্ট স্থগিত হবে।</p>
            <button disabled={busy} onClick={reveal} className="btn-blood w-full !py-3 inline-flex items-center justify-center gap-2">
              {busy ? <Spinner className="w-5 h-5" /> : '📞 নম্বর দেখুন'}
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2 animate-pop-in">
            <a className="btn-blood text-center !py-3" href={telLink(contact)}>📞 কল করুন</a>
            <a className="btn-blood text-center !py-3 !bg-green-600 hover:!bg-green-700" target="_blank" rel="noreferrer" href={waLink(contact, `আসসালামু আলাইকুম, BloodLink-এ আপনার ডোনার প্রোফাইল দেখে যোগাযোগ করছি।`)}>💬 WhatsApp</a>
          </div>
        )}
      </Card>

      <p className="text-xs text-gray-400">⚕️ BloodLink চিকিৎসাগত উপযুক্ততা নির্ধারণ করে না — সিদ্ধান্ত চিকিৎসকের। অপরিচিত নম্বরে অগ্রিম টাকা দেবেন না।</p>
      <p><Link href="/donors" className="text-sm font-bold text-blood-700">← সব ডোনার</Link></p>
      <Toast msg={toast} />
    </div>
  );
}
