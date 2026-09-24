'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, ensureSeed } from '@/lib/store';
import { timeAgo } from '@/lib/utils';
import { DashShell } from '../page';
import { Card, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Notifs() {
  const [list, setList] = useState([]);
  useEffect(() => { ensureSeed(); setList(store.getNotif()); }, []);
  if (!list.length) return <DashShell title="নোটিফিকেশন"><EmptyState title="নতুন কোনো নোটিফিকেশন নেই।" /></DashShell>;
  return (
    <DashShell title="নোটিফিকেশন">
      <div className="space-y-2">{list.map(n => (
        <Card key={n.id} className={cn(!n.is_read && 'border-l-4 !border-l-blood-500')}>
          <p className="font-bold text-sm">{n.title}</p><p className="text-sm text-gray-600">{n.message}</p>
          <div className="flex items-center justify-between mt-1"><span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
            <span className="flex gap-2">{n.ref && <Link href={`/request/${n.ref}`} className="text-xs font-bold text-blood-700">অনুরোধ দেখুন →</Link>}
            {!n.is_read && <button className="text-xs text-gray-500 underline" onClick={() => { store.markNotifRead(n.id); setList(store.getNotif()); }}>পড়া হয়েছে</button>}</span></div>
        </Card>))}
      </div>
    </DashShell>
  );
}
