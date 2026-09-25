'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, ensureSeed } from '@/lib/store';
import { normRequest } from '@/lib/api';
import { DashShell } from '../page';
import { Card, EmptyState, Toast } from '@/components/ui';

export default function Saved() {
  const [list, setList] = useState(null);
  const [toast, setToast] = useState('');
  async function reload() {
    try {
      const r = await fetch('/api/saved');
      const j = await r.json();
      if (!j.ok) throw new Error();
      setList(j.data.map(normRequest));
    } catch {
      const ids = store.getSaved();
      setList(store.getRequests().filter(x => ids.includes(x.id)));
    }
  }
  useEffect(() => { ensureSeed(); reload(); }, []);
  async function remove(id) {
    try {
      await fetch('/api/saved', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: id }) });
    } catch {}
    store.toggleSave(id);
    setList(l => (l || []).filter(x => x.id !== id));
    setToast('সরিয়ে দেওয়া হয়েছে।'); setTimeout(() => setToast(''), 1500);
  }
  if (list === null) return <DashShell title="সংরক্ষিত অনুরোধ"><p className="text-sm text-gray-400">লোড হচ্ছে...</p></DashShell>;
  if (!list.length) return <DashShell title="সংরক্ষিত অনুরোধ"><EmptyState title="আপনার কোনো সংরক্ষিত অনুরোধ নেই।" /></DashShell>;
  return (
    <DashShell title="সংরক্ষিত অনুরোধ">
      <div className="grid sm:grid-cols-2 gap-3">{list.map(r => (
        <Card key={r.id} className="card-hover"><p className="font-bold">{r.blood_group} রক্ত প্রয়োজন • {r.bags_required} ব্যাগ</p>
          <p className="text-sm text-gray-500">{r.hospital || r.location_text} • {r.required_date}</p>
          <div className="flex gap-2 mt-2"><Link href={`/request/${r.id}`} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">দেখুন</Link>
          <button onClick={() => remove(r.id)} className="text-xs font-bold bg-red-50 text-red-700 rounded-lg px-3 py-1.5">সরিয়ে দিন</button></div></Card>))}
      </div>
      <Toast msg={toast} />
    </DashShell>
  );
}
