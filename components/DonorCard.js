'use client';
import { useState } from 'react';
import { Card, Badge, Avatar, Toast } from './ui';
import { disName } from '@/lib/locations';
import { telLink, waLink } from '@/lib/utils';
import Icon, { Spinner } from './icons';

export default function DonorCard({ d }) {
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState(d.phone || null);
  const [err, setErr] = useState('');

  async function reveal() {
    if (contact) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/donors/${d.id}/contact`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'যোগাযোগ করা যায়নি');
      setContact(j.data.phone);
    } catch (e) {
      setErr(e.message); setTimeout(() => setErr(''), 2200);
    }
    setBusy(false);
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
      {!contact ? (
        <button disabled={busy} onClick={reveal} className="btn-blood w-full mt-3 !py-2.5 inline-flex items-center justify-center gap-2">
          {busy ? <Spinner className="w-4 h-4" /> : <Icon name="phone" className="w-4 h-4" />}
          {busy ? 'আনছি...' : 'যোগাযোগ করুন'}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <a className="btn-blood text-center !py-2.5 inline-flex items-center justify-center gap-1.5" href={telLink(contact)}><Icon name="phone" className="w-4 h-4" />কল</a>
          <a className="btn-blood text-center !py-2.5 !bg-green-600 hover:!bg-green-700 inline-flex items-center justify-center gap-1.5" target="_blank" rel="noreferrer" href={waLink(contact, `আসসালামু আলাইকুম, BloodLink-এ আপনার ডোনার প্রোফাইল দেখে যোগাযোগ করছি।`)}>💬 WhatsApp</a>
        </div>
      )}
      <Toast msg={err} />
    </Card>
  );
}
