'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { normRequest } from '@/lib/api';
import Shell from '../layout';
import { Card, Badge, Toast } from '@/components/ui';
import { STATUS_LABEL, URGENCY_LABEL } from '@/lib/constants';

const FILTERS = ['সব', 'ACTIVE', 'PENDING_REVIEW', 'FULFILLED', 'EXPIRED', 'CANCELLED', 'REJECTED'];
const FBN = { 'সব': 'সব', 'ACTIVE': 'সক্রিয়', 'PENDING_REVIEW': 'পর্যালোচনায়', 'FULFILLED': 'পূরণ হয়েছে', 'EXPIRED': 'মেয়াদ শেষ', 'CANCELLED': 'বাতিল', 'REJECTED': 'প্রত্যাখ্যাত' };

export default function AdminRequests() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('সব');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(null);

  async function reload(f = filter) {
    try {
      const p = new URLSearchParams({ all: '1', limit: '50' });
      if (f !== 'সব') p.set('status', f);
      const r = await fetch('/api/blood-requests?' + p.toString());
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setList(j.data.map(normRequest));
    } catch (e) {
      setList(store.getRequests());
      if (e.message && !String(e.message).includes('Failed to fetch')) say(e.message);
    }
  }
  useEffect(() => { ensureSeed(); reload(); }, []);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 1800); }

  async function act(id, status, msg) {
    setBusy(id + status);
    try {
      const r = await fetch(`/api/blood-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'ব্যর্থ');
      say(msg); reload();
    } catch (e) {
      store.updateRequest(id, { status }); setList(store.getRequests());
      say(msg + ' (ডেমো)');
    }
    setBusy(null);
  }

  async function del(id) {
    setBusy(id + 'del');
    try {
      const r = await fetch(`/api/blood-requests/${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'মোছা যায়নি');
      say('✓ মুছে ফেলা হয়েছে।'); reload();
    } catch (e) { say(e.message); }
    setBusy(null);
  }

  const shown = list || [];
  return <Shell title="রক্তের অনুরোধ ব্যবস্থাপনা">
    <div className="flex gap-1.5 overflow-x-auto pb-2">{FILTERS.map(f => <button key={f} onClick={() => { setFilter(f); reload(f); }} className={`text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap ${filter === f ? 'bg-gray-900 text-white' : 'bg-white'}`}>{FBN[f]}</button>)}</div>
    {list === null ? <p className="text-sm text-gray-400 mt-2">লোড হচ্ছে...</p> : (
      <div className="space-y-2 mt-2">{shown.map(r => (
        <Card key={r.id}>
          <div className="flex justify-between text-sm gap-2"><span className="font-extrabold">{r.id} • {r.blood_group} • {r.hospital || r.location_text}</span><Badge tone="gray">{STATUS_LABEL[r.status] || r.status}</Badge></div>
          <p className="text-xs text-gray-500 mt-0.5">{URGENCY_LABEL[r.urgency]} • {r.district_id} • {r.required_date}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[['অনুমোদন', 'ACTIVE'], ['প্রত্যাখ্যান', 'REJECTED'], ['স্থগিত', 'CANCELLED'], ['পূরণ', 'FULFILLED']].map(([l, s]) => (
              <button key={l} disabled={!!busy} onClick={() => act(r.id, s, `অনুরোধ ${l} করা হয়েছে ✓`)} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 disabled:opacity-50">{l}</button>))}
            <button disabled={!!busy} onClick={() => del(r.id)} className="text-xs font-bold bg-red-50 text-red-700 rounded-lg px-3 py-1.5 disabled:opacity-50">মুছে ফেলুন</button>
          </div>
        </Card>))}
        {shown.length === 0 && <p className="text-sm text-gray-400 text-center py-6">এই ফিল্টারে কিছু নেই।</p>}
      </div>)}
    <Toast msg={toast} /></Shell>;
}
