'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { DashShell } from '../page';
import { Card, Input } from '@/components/ui';

function Msgs() {
  const sp = useSearchParams();
  const cid = sp.get('to') || 'general';
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  useEffect(() => { ensureSeed(); setMsgs(store.getMsgs(cid)); }, [cid]);
  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const m = { id: Date.now(), from: store.getUser()?.name || 'আপনি', text: text.trim(), at: new Date().toISOString() };
    store.sendMsg(cid, m); setMsgs(store.getMsgs(cid)); setText('');
  }
  return (
    <div className="space-y-2">
      <Card><p className="text-sm text-gray-500">💬 {cid === 'general' ? 'সাধারণ কথোপকথন' : `${cid} নম্বর অনুরোধ সম্পর্কে`}</p></Card>
      <div className="space-y-2 min-h-[200px]">
        {msgs.length === 0 && <p className="text-sm text-gray-400 text-center py-6">এখনো কোনো মেসেজ নেই। নিচে লিখে শুরু করুন।</p>}
        {msgs.map(m => <div key={m.id} className="bg-white rounded-xl border p-2.5 max-w-[85%]"><p className="text-xs text-gray-400">{m.from}</p><p className="text-sm font-semibold">{m.text}</p></div>)}
      </div>
      <form onSubmit={send} className="flex gap-2 sticky bottom-16 md:static bg-[#fafafa] py-2">
        <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="মেসেজ লিখুন..." aria-label="মেসেজ লিখুন" />
        <button className="btn-blood !w-auto px-5" aria-label="পাঠান">➤</button>
      </form>
    </div>
  );
}
export default function MessagesPage() { return <DashShell title="মেসেজ"><Suspense><Msgs /></Suspense></DashShell>; }
