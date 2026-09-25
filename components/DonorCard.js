'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Avatar, Toast } from './ui';
import { disName } from '@/lib/locations';
import { telLink } from '@/lib/utils';
import Icon, { Spinner } from './icons';

export default function DonorCard({ d }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function startChat() {
    if (!d.user_id) { router.push('/dashboard/messages'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ withUserId: d.user_id }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'চ্যাট খোলা যায়নি');
      router.push('/dashboard/messages?to=' + j.data.id);
    } catch (e) {
      if (String(e.message).includes('Failed to fetch')) router.push('/dashboard/messages');
      else { setErr(e.message); setTimeout(() => setErr(''), 2000); setBusy(false); }
    }
  }

  return (
    <Card className="card-hover">
      <div className="flex items-center gap-3">
        <Avatar name={d.name} />
        <div className="flex-1">
          <p className="font-bold">{d.name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1"><Icon name="pin" className="w-3.5 h-3.5" />{disName(d.district_id)}</p>
        </div>
        <span className="text-xl font-extrabold text-blood-700">{d.blood_group}</span>
      </div>
      <div className="mt-2"><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? '🟢 বর্তমানে উপলভ্য' : '⚪ বর্তমানে উপলভ্য নই'}</Badge></div>
      <p className="text-sm text-gray-600 mt-1">রক্তদান: {d.donations || 0} বার</p>
      {d.phone
        ? <a className="btn-blood w-full text-center mt-3 !py-2.5 inline-flex items-center justify-center gap-2" href={telLink(d.phone)}><Icon name="phone" className="w-4 h-4" />যোগাযোগ করুন</a>
        : <button disabled={busy} onClick={startChat} className="btn-blood w-full mt-3 !py-2.5 inline-flex items-center justify-center gap-2">{busy ? <Spinner className="w-4 h-4" /> : <Icon name="chat" className="w-4 h-4" />}{busy ? 'খুলছে...' : 'মেসেজ করুন'}</button>}
      <Toast msg={err} />
    </Card>
  );
}
