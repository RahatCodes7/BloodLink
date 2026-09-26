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
  async function setStatus(id, status, msg) {
    try {
      const r = await fetch(`/api/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'ব্যর্থ');
      say(msg); reload();
    } catch (e) { say(e.message); }
  }
  if (list === null) return <Shell title="রিপোর্ট ব্যবস্থাপনা"><p className="text-sm text-gray-400">লোড হচ্ছে...</p></Shell>;
  if (!list.length) return <Shell title="রিপোর্ট ব্যবস্থাপনা"><EmptyState title="কোনো রিপোর্ট নেই।" hint="ব্যবহারকারীরা রিপোর্ট করলে এখানে দেখা যাবে।" /></Shell>;
  return <Shell title="রিপোর্ট ব্যবস্থাপনা"><div className="space-y-2">{list.map(r => (
    <Card key={r.id}><div className="flex justify-between text-sm gap-2"><p className="font-bold">{r.reason} • অনুরোধ {r.target_id || r.request_id}</p><Badge tone={tone(r.status)}>{r.status}</Badge></div>
      <p className="text-xs text-gray-500">{r.description || '—'}{r.created_at ? ` • ${timeAgo(r.created_at)}` : ''}</p>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        <button onClick={() => setStatus(r.id, 'RESOLVED', '✓ সমাধান হয়েছে')} className="text-xs font-bold bg-green-100 text-green-800 rounded-lg px-3 py-1.5">সমাধান করুন</button>
        <button onClick={() => setStatus(r.id, 'DISMISSED', 'বাতিল হয়েছে')} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">বাতিল করুন</button>
        <button onClick={() => setStatus(r.id, 'REVIEWING', 'পর্যালোচনায় নেওয়া হয়েছে')} className="text-xs font-bold bg-orange-100 text-orange-800 rounded-lg px-3 py-1.5">পর্যালোচনা</button>
      </div></Card>))}</div><Toast msg={toast} /></Shell>;
}
