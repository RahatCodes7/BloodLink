'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, ensureSeed } from '@/lib/store';
import { DashShell } from '../page';
import { Card, EmptyState } from '@/components/ui';

export default function Saved() {
  const [list, setList] = useState([]);
  useEffect(() => { ensureSeed(); const ids = store.getSaved(); setList(store.getRequests().filter(r => ids.includes(r.id))); }, []);
  function remove(id) { store.toggleSave(id); setList(l => l.filter(x => x.id !== id)); }
  if (!list.length) return <DashShell title="সংরক্ষিত অনুরোধ"><EmptyState title="আপনার কোনো সংরক্ষিত অনুরোধ নেই।" /></DashShell>;
  return (
    <DashShell title="সংরক্ষিত অনুরোধ">
      <div className="grid sm:grid-cols-2 gap-3">{list.map(r => (
        <Card key={r.id}><p className="font-bold">{r.blood_group} রক্ত প্রয়োজন • {r.bags_required} ব্যাগ</p>
          <p className="text-sm text-gray-500">{r.hospital} • {r.required_date}</p>
          <div className="flex gap-2 mt-2"><Link href={`/request/${r.id}`} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">দেখুন</Link>
          <button onClick={() => remove(r.id)} className="text-xs font-bold bg-red-50 text-red-700 rounded-lg px-3 py-1.5">সরিয়ে দিন</button></div></Card>))}
      </div>
    </DashShell>
  );
}
