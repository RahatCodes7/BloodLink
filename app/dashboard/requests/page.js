'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, ensureSeed } from '@/lib/store';
import { STATUS_LABEL } from '@/lib/constants';
import { DashShell } from '../page';
import { Card, Badge, EmptyState, Toast } from '@/components/ui';

export default function MyRequests() {
  const [list, setList] = useState([]);
  const [toast, setToast] = useState('');
  function reload() { setList(store.getRequests()); }
  useEffect(() => { ensureSeed(); reload(); }, []);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 2000); reload(); }
  if (!list.length) return <DashShell title="আমার রক্তের অনুরোধ"><EmptyState title="এখনো কোনো অনুরোধ করেননি।" /></DashShell>;
  return (
    <DashShell title="আমার রক্তের অনুরোধ">
      <div className="grid sm:grid-cols-2 gap-3">
        {list.slice(0, 12).map(r => (
          <Card key={r.id}>
            <div className="flex justify-between items-center"><span className="text-xl font-extrabold text-blood-700">{r.blood_group} • {r.bags_required} ব্যাগ</span><Badge tone={r.status === 'ACTIVE' ? 'green' : 'gray'}>{STATUS_LABEL[r.status]}</Badge></div>
            <p className="text-sm text-gray-500">{r.hospital}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Link href={`/request/${r.id}`} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">বিস্তারিত</Link>
              <button className="text-xs font-bold bg-green-100 text-green-800 rounded-lg px-3 py-1.5" onClick={() => { store.updateRequest(r.id, { status: 'FULFILLED' }); say('✓ রক্তের ব্যবস্থা হয়েছে হিসেবে চিহ্নিত হয়েছে।'); }}>রক্ত পাওয়া গেছে</button>
              <button className="text-xs font-bold bg-red-50 text-red-700 rounded-lg px-3 py-1.5" onClick={() => { store.updateRequest(r.id, { status: 'CANCELLED' }); say('অনুরোধ বাতিল হয়েছে।'); }}>বাতিল করুন</button>
            </div>
          </Card>))}
      </div><Toast msg={toast} />
    </DashShell>
  );
}
