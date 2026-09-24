'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import Shell from '../layout';
import { Card, Badge, EmptyState, Toast } from '@/components/ui';
export default function AdminReports() {
  const [list, setList] = useState([]);
  const [toast, setToast] = useState('');
  useEffect(() => { ensureSeed(); setList(store.getReports()); }, []);
  if (!list.length) return <Shell title="রিপোর্ট ব্যবস্থাপনা"><EmptyState title="কোনো রিপোর্ট নেই।" hint="ব্যবহারকারীরা রিপোর্ট করলে এখানে দেখা যাবে।" /></Shell>;
  return <Shell title="রিপোর্ট ব্যবস্থাপনা"><div className="space-y-2">{list.map(r => (
    <Card key={r.id}><div className="flex justify-between text-sm"><p className="font-bold">{r.reason} • অনুরোধ {r.request_id}</p><Badge tone="orange">{r.status}</Badge></div>
      <p className="text-xs text-gray-500">{r.description || '—'} • রিপোর্টার: {r.reporter}</p>
      <div className="flex gap-1.5 mt-2 flex-wrap">{['সমাধান করুন', 'বাতিল করুন', 'অনুরোধ সরান'].map(a => <button key={a} onClick={() => { setToast(a + ' ✓'); setTimeout(() => setToast(''), 1500); }} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{a}</button>)}</div></Card>))}</div><Toast msg={toast} /></Shell>;
}
