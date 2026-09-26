'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, ensureSeed } from '@/lib/store';
import { timeAgo } from '@/lib/utils';
import { DashShell } from '../page';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

function normDb(n) {
  return { id: n.id, title: n.title, message: n.message, ref: n.related_request_id || null, is_read: n.is_read, created_at: n.created_at, db: true };
}

export default function Notifs() {
  const [list, setList] = useState(null);

  async function reload() {
    let merged = store.getNotif();
    try {
      const r = await fetch('/api/notifications?limit=30');
      const j = await r.json();
      if (j.ok) {
        const db = (j.data || []).map(normDb);
        const seen = new Set(db.map(n => n.id));
        merged = [...db, ...merged.filter(n => !seen.has(n.id))]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    } catch {}
    setList(merged);
  }
  useEffect(() => { ensureSeed(); reload(); }, []);

  async function markRead(n) {
    if (n.db) {
      try { await fetch(`/api/notifications/${n.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) }); } catch {}
    } else {
      store.markNotifRead(n.id);
    }
    setList(l => (l || []).map(x => x.id === n.id ? { ...x, is_read: true } : x));
  }

  if (list === null) return <DashShell title="নোটিফিকেশন"><Skeleton /><Skeleton /></DashShell>;
  if (!list.length) return <DashShell title="নোটিফিকেশন"><EmptyState title="নতুন কোনো নোটিফিকেশন নেই।" /></DashShell>;
  return (
    <DashShell title="নোটিফিকেশন">
      <div className="space-y-2">{list.map(n => (
        <Card key={n.id} className={cn(!n.is_read && 'border-l-4 !border-l-blood-500')}>
          <p className="font-bold text-sm">{n.title}</p><p className="text-sm text-gray-600">{n.message}</p>
          <div className="flex items-center justify-between mt-1"><span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
            <span className="flex gap-2">{n.ref && <Link href={`/request/${n.ref}`} className="text-xs font-bold text-blood-700">অনুরোধ দেখুন →</Link>}
            {!n.is_read && <button className="text-xs text-gray-500 underline" onClick={() => markRead(n)}>পড়া হয়েছে</button>}</span></div>
        </Card>))}
      </div>
    </DashShell>
  );
}
