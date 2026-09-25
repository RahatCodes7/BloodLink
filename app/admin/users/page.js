'use client';
import { useEffect, useState } from 'react';
import Shell from '../layout';
import { Card, Badge, EmptyState } from '@/components/ui';

// DB-driven: public users API এখনো নেই, তাই অনুরোধকারীদের তালিকা দেখায়।
// Full user-list API পরে যোগ হবে।
export default function AdminUsers() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const [rq, dn] = await Promise.all([
          fetch('/api/blood-requests?limit=50').then(r => r.json()),
          fetch('/api/donors?limit=50').then(r => r.json())
        ]);
        const map = {};
        (rq.data || []).forEach(r => { if (r.requester_id) map[r.requester_id] = { id: r.requester_id, requests: 0, src: 'অনুরোধকারী' }; });
        (rq.data || []).forEach(r => { if (r.requester_id && map[r.requester_id]) map[r.requester_id].requests++; });
        setRows(Object.values(map));
      } catch { setRows([]); }
    })();
  }, []);
  if (rows === null) return <Shell title="ব্যবহারকারী ব্যবস্থাপনা"><p className="text-sm text-gray-400">লোড হচ্ছে...</p></Shell>;
  if (!rows.length) return <Shell title="ব্যবহারকারী ব্যবস্থাপনা"><EmptyState title="এখনো কোনো ব্যবহারকারী কার্যক্রম নেই।" hint="কেউ অনুরোধ করলে এখানে দেখা যাবে।" icon="blood-badge.png" /></Shell>;
  return <Shell title="ব্যবহারকারী ব্যবস্থাপনা"><div className="space-y-2">{rows.map(u => (
    <Card key={u.id}><div className="flex justify-between"><p className="font-bold font-mono text-xs">{u.id.slice(0, 8)}…</p><Badge tone="green">{u.src}</Badge></div>
      <p className="text-xs text-gray-500">সক্রিয় অনুরোধ: {u.requests}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">{['প্রোফাইল দেখুন', 'যাচাই করুন', 'স্থগিত করুন'].map(a => <button key={a} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{a}</button>)}</div></Card>))}</div></Shell>;
}
