'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { timeAgo } from '@/lib/utils';
import { DashShell } from '../page';
import { Card, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

function fmtWho(m, meId) {
  if (!meId) return m.from || 'তারা';
  if (m.sender_id && m.sender_id === meId) return 'আপনি';
  if (m.from) return m.from;
  return 'তারা';
}

function Msgs() {
  const sp = useSearchParams();
  const router = useRouter();
  const cid = sp.get('to') || null;
  const [convs, setConvs] = useState(null); // null = API নেই/local mode
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [meId, setMeId] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadThread = useCallback(async (id, silent) => {
    try {
      const r = await fetch(`/api/messages?conversationId=${id}&limit=30`);
      const j = await r.json();
      if (!j.ok) throw new Error();
      setMsgs([...j.data].reverse());
    } catch {
      setMsgs(store.getMsgs(id)); // local fallback
    }
    if (!silent) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try {
        const me = await fetch('/api/auth/me').then(r => r.json());
        if (live && me.ok) setMeId(me.data.id);
      } catch {}
      try {
        const r = await fetch('/api/conversations').then(r => r.json());
        if (!r.ok) throw new Error();
        if (live) {
          setConvs(r.data);
          const active = cid || (r.data[0] && r.data[0].id);
          if (active) loadThread(active);
        }
      } catch {
        if (live) { setConvs(null); setMsgs(store.getMsgs(cid || 'general')); }
      }
    })();
    return () => { live = false; };
  }, [cid, loadThread]);

  // ৫ সেকেন্ড polling — নতুন মেসেজ auto-আসবে:
  useEffect(() => {
    if (convs === null) return;
    const active = cid || (convs[0] && convs[0].id);
    if (!active) return;
    const t = setInterval(() => loadThread(active, true), 5000);
    return () => clearInterval(t);
  }, [cid, convs, loadThread]);

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [msgs.length]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const active = cid || (convs && convs[0] && convs[0].id) || 'general';
    const body = text.trim();
    setText(''); setSending(true);
    try {
      const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: active, message: body }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      loadThread(active, true);
    } catch {
      // local fallback (demo):
      const m = { id: Date.now(), from: store.getUser()?.name || 'আপনি', text: body, at: new Date().toISOString() };
      store.sendMsg(active, m); setMsgs(store.getMsgs(active));
    }
    setSending(false);
  }

  const active = cid || (convs && convs[0] && convs[0].id);
  const activeConv = convs && convs.find(c => c.id === active);

  return (
    <div className="space-y-2">
      {convs && convs.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="কথোপকথন">
          {convs.map(c => (
            <button key={c.id} role="tab" aria-selected={c.id === active}
              onClick={() => router.push('/dashboard/messages?to=' + c.id)}
              className={cn('shrink-0 text-xs font-bold rounded-xl px-3 py-2 border transition',
                c.id === active ? 'bg-blood-600 text-white border-blood-600' : 'bg-white hover:border-blood-300')}>
              💬 {(c.last_message || 'নতুন চ্যাট').slice(0, 18) || 'চ্যাট'}
              {c.last_at && <span className="block text-[10px] opacity-70 font-normal">{timeAgo(c.last_at)}</span>}
            </button>
          ))}
        </div>
      )}
      <Card><p className="text-sm text-gray-500">💬 {activeConv ? (activeConv.last_message ? 'কথোপকথন চলছে' : 'নতুন কথোপকথন') : active ? 'সাধারণ কথোপকথন' : 'মেসেজ'}</p></Card>
      <div className="space-y-2 min-h-[200px]" aria-live="polite">
        {msgs.length === 0 && <p className="text-sm text-gray-400 text-center py-6">এখনো কোনো মেসেজ নেই। নিচে লিখে শুরু করুন — অপর পক্ষ নোটিফিকেশন পাবেন।</p>}
        {msgs.map(m => {
          const mine = meId ? m.sender_id === meId : m.from === (store.getUser()?.name);
          return (
            <div key={m.id} className={cn('rounded-xl border p-2.5 max-w-[85%]', mine ? 'bg-red-50 border-red-100 ml-auto' : 'bg-white')}>
              <p className="text-xs text-gray-400">{fmtWho(m, meId)}</p>
              <p className="text-sm font-semibold">{m.message || m.text}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {!active && convs && convs.length === 0 && <EmptyState title="কোনো কথোপকথন নেই।" hint="ডোনার বা অনুরোধ থেকে মেসেজ করুন।" />}
      {(active || convs === null) && (
        <form onSubmit={send} className="flex gap-2 sticky bottom-16 md:static bg-[#fafafa] py-2">
          <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="মেসেজ লিখুন..." aria-label="মেসেজ লিখুন" />
          <button className="btn-blood !w-auto px-5" disabled={sending} aria-label="পাঠান">{sending ? '...' : '➤'}</button>
        </form>
      )}
    </div>
  );
}
export default function MessagesPage() { return <DashShell title="মেসেজ"><Suspense><Msgs /></Suspense></DashShell>; }
