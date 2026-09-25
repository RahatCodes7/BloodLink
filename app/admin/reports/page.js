'use client';
import { useEffect, useState } from 'react';
import Shell from '../layout';
import { Card, Badge, EmptyState, Toast } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

const tone = (s) => s === 'PENDING' ? 'orange' : s === 'REVIEWING' ? 'blood' : s === 'RESOLVED' ? 'green' : 'gray';

export default function AdminReports() {
  const [list, setList] = useState(null);
  const [toast, setToast] = useState('');
  async function reload() {
    try {
      const r = await fetch('/api/reports');
      const j = await r.json();
      if (!j.ok) throw new Error();
      setList(j.data);
    } catch {
      const { store } = await import('@/lib/store');
      setList(store.getReports());
    }
  }
  useEffect(() => { reload(); }, []);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 1500); }
  if (list === null) return <Shell title="রিপোর্ট ব্যবস্থাপনা"><p className="text-sm text-gray-400">লোড হচ্ছে...</p></Shell>;
  if (!list.length) return <Shell title="রিপোর্ট ব্যবস্থাপনা"><EmptyState title="কোনো রিপোর্ট নেই।" hint="ব্যবহারকারীরা রিপোর্ট করলে এখানে দেখা যাবে।" /></Shell>;
  return <Shell title="রিপোর্ট ব্যবস্থাপনা"><div className="space-y-2">{list.map(r => (
    <Card key={r.id}><div className="flex justify-between text-sm gap-2"><p className="font-bold">{r.reason} • অনুরোধ {r.target_id || r.request_id}</p><Badge tone={tone(r.status)}>{r.status}</Badge></div>
      <p className="text-xs text-gray-500">{r.description || '—'}{r.created_at ? ` • ${timeAgo(r.created_at)}` : ''}</p>
      <div className="flex gap-1.5 mt-2 flex-wrap">{['সমাধান করুন', 'বাতিল করুন', 'অনুরোধ সরান'].map(a => <button key={a} onClick={() => say(a + ' ✓')} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{a}</button>)}</div></Card>))}</div><Toast msg={toast} /></Shell>;
}
