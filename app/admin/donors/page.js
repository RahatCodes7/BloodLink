'use client';
import { useEffect, useState } from 'react';
import Shell from '../layout';
import { Card, Badge, EmptyState, Toast } from '@/components/ui';
import { normDonor } from '@/lib/api';

export default function AdminDonors() {
  const [list, setList] = useState(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(null);

  async function reload() {
    try {
      const r = await fetch('/api/donors?availableOnly=false&limit=50');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setList(j.data.map(normDonor));
    } catch { setList([]); }
  }
  useEffect(() => { reload(); }, []);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 1800); }

  async function act(id, body, msg) {
    setBusy(id);
    try {
      const r = await fetch(`/api/donors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'ব্যর্থ');
      say(msg); reload();
    } catch (e) { say(e.message); }
    setBusy(null);
  }

  if (list === null) return <Shell title="রক্তদাতা ব্যবস্থাপনা"><p className="text-sm text-gray-400">লোড হচ্ছে...</p></Shell>;
  if (!list.length) return <Shell title="রক্তদাতা ব্যবস্থাপনা"><EmptyState title="কোনো ডোনার নেই।" icon="donor-hands.png" /></Shell>;
  return <Shell title="রক্তদাতা ব্যবস্থাপনা"><div className="space-y-2">{list.map(d => (
    <Card key={d.id}>
      <div className="flex justify-between gap-2"><p className="font-bold">❤️ {d.name} • {d.blood_group}</p><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? 'উপলভ্য' : 'অনুপলভ্য'}</Badge></div>
      <p className="text-xs text-gray-500 mt-0.5">{d.district_id}{d.verified ? ' • ✓ যাচাইকৃত' : ''}</p>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {!d.verified && <button disabled={!!busy} onClick={() => act(d.id, { verified: true }, '✓ ডোনার যাচাই হয়েছে')} className="text-xs font-bold bg-green-100 text-green-800 rounded-lg px-3 py-1.5 disabled:opacity-50">যাচাই করুন</button>}
        <button disabled={!!busy} onClick={() => act(d.id, { availability: d.available ? 'UNAVAILABLE' : 'AVAILABLE' }, d.available ? 'স্থগিত হয়েছে' : '✓ সক্রিয় হয়েছে')} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5 disabled:opacity-50">{d.available ? 'স্থগিত করুন' : 'সক্রিয় করুন'}</button>
      </div>
    </Card>))}</div><Toast msg={toast} /></Shell>;
}
