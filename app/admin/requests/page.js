'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import Shell from '../layout';
import { Card, Toast } from '@/components/ui';

export default function AdminRequests() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('সব');
  const [toast, setToast] = useState('');
  useEffect(() => { ensureSeed(); setList(store.getRequests()); }, []);
  function act(id, status, msg) { store.updateRequest(id, { status }); setList(store.getRequests()); setToast(msg); setTimeout(() => setToast(''), 1800); }
  const shown = list.filter(r => filter === 'সব' || (filter === 'জরুরি' ? r.urgency !== 'normal' : true));
  return <Shell title="রক্তের অনুরোধ ব্যবস্থাপনা">
    <div className="flex gap-1.5 overflow-x-auto pb-2">{['সব', 'পর্যালোচনায়', 'সক্রিয়', 'জরুরি', 'পূরণ হয়েছে', 'মেয়াদ শেষ', 'রিপোর্ট করা'].map(f => <button key={f} onClick={() => setFilter(f)} className={`text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap ${filter === f ? 'bg-gray-900 text-white' : 'bg-white'}`}>{f}</button>)}</div>
    <div className="space-y-2 mt-2">{shown.map(r => (
      <Card key={r.id}><div className="flex justify-between text-sm"><span className="font-extrabold">{r.id} • {r.blood_group} • {r.hospital}</span><span className="text-gray-500">{r.status}</span></div>
        <div className="flex flex-wrap gap-1.5 mt-2">{[['অনুমোদন', 'ACTIVE'], ['প্রত্যাখ্যান', 'REJECTED'], ['স্থগিত', 'CANCELLED'], ['পূরণ', 'FULFILLED']].map(([l, s]) => <button key={l} onClick={() => act(r.id, s, `অনুরোধ ${l} করা হয়েছে ✓`)} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{l}</button>)}
          <button onClick={() => { const all = store.getRequests().filter(x => x.id !== r.id); localStorage.setItem('bl_requests', JSON.stringify(all)); setList(all); }} className="text-xs font-bold bg-red-50 text-red-700 rounded-lg px-3 py-1.5">মুছে ফেলুন</button></div></Card>))}
    </div><Toast msg={toast} /></Shell>;
}
