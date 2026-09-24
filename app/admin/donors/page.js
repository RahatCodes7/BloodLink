'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import Shell from '../layout';
import { Card, Badge } from '@/components/ui';
export default function AdminDonors() {
  const [list, setList] = useState([]);
  useEffect(() => { ensureSeed(); setList(store.getDonors()); }, []);
  return <Shell title="রক্তদাতা ব্যবস্থাপনা"><div className="space-y-2">{list.map(d => (
    <Card key={d.id}><div className="flex justify-between"><p className="font-bold">❤️ {d.name} • {d.blood_group}</p><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? 'উপলভ্য' : 'অনুপলভ্য'}</Badge></div>
      <div className="flex gap-1.5 mt-2 flex-wrap">{['ফোন যাচাই', 'স্থগিত', 'রিপোর্ট দেখুন'].map(a => <button key={a} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{a}</button>)}</div></Card>))}</div></Shell>;
}
