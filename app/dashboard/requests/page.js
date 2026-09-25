'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, ensureSeed } from '@/lib/store';
import { STATUS_LABEL } from '@/lib/constants';
import { DashShell } from '../page';
import { Card, Badge, EmptyState, Toast, Modal } from '@/components/ui';

const tone = (s) => s === 'ACTIVE' ? 'green' : s === 'FULFILLED' ? 'blood' : s === 'CANCELLED' ? 'gray' : s === 'EXPIRED' ? 'orange' : 'gray';

export default function MyRequests() {
  const [list, setList] = useState(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(null);
  const [delId, setDelId] = useState(null);

  async function reload() {
    try {
      const r = await fetch('/api/blood-requests?mine=1');
      const j = await r.json();
      if (!j.ok) throw new Error();
      setList(j.data);
    } catch {
      setList(store.getRequests());
    }
  }
  useEffect(() => { ensureSeed(); reload(); }, []);

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }

  async function setStatus(id, status, msg) {
    setBusy(id + status);
    try {
      const r = await fetch(`/api/blood-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'ব্যর্থ হয়েছে');
      store.updateRequest(id, { status });
      say(msg);
      reload();
    } catch (e) {
      if (String(e.message).includes('Failed to fetch') || String(e.message).includes('DATABASE_URL')) {
        store.updateRequest(id, { status }); say(msg + ' (ডেমো)'); reload();
      } else say(e.message);
    }
    setBusy(null);
  }

  async function remove() {
    if (!delId) return;
    const id = delId; setDelId(null); setBusy(id + 'del');
    try {
      const r = await fetch(`/api/blood-requests/${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'মোছা যায়নি');
      say('✓ অনুরোধ মুছে ফেলা হয়েছে।');
      reload();
    } catch (e) {
      say(e.message);
    }
    setBusy(null);
  }

  if (list === null) return <DashShell title="আমার রক্তের অনুরোধ"><p className="text-sm text-gray-400">লোড হচ্ছে...</p></DashShell>;
  if (!list.length) return <DashShell title="আমার রক্তের অনুরোধ"><EmptyState title="এখনো কোনো অনুরোধ করেননি।" hint="প্রয়োজনে নতুন অনুরোধ করুন।" /></DashShell>;

  return (
    <DashShell title="আমার রক্তের অনুরোধ">
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map(r => {
          const active = r.status === 'ACTIVE';
          return (
            <Card key={r.id} className={!active ? 'opacity-90' : ''}>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xl font-extrabold text-blood-700">{r.blood_group} • {r.bags_required} ব্যাগ</span>
                <Badge tone={tone(r.status)}>{STATUS_LABEL[r.status] || r.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{r.hospital || r.location_text} • {r.required_date}</p>
              {r.status === 'FULFILLED' && <p className="text-xs font-bold text-green-700 mt-1">✓ রক্তের ব্যবস্থা হয়ে গেছে — ধন্যবাদ!</p>}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <Link href={`/request/${r.id}`} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition">বিস্তারিত</Link>
                {active && (
                  <>
                    <button disabled={busy} onClick={() => setStatus(r.id, 'FULFILLED', '✓ রক্তের ব্যবস্থা হয়েছে! এটি আর সক্রিয় তালিকায় দেখাবে না।')} className="text-xs font-bold bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700 transition disabled:opacity-50">
                      {busy === r.id + 'FULFILLED' ? '...' : '✓ রক্ত পাওয়া গেছে'}
                    </button>
                    <button disabled={busy} onClick={() => setStatus(r.id, 'CANCELLED', 'অনুরোধ বাতিল হয়েছে।')} className="text-xs font-bold bg-orange-100 text-orange-800 rounded-lg px-3 py-1.5 transition disabled:opacity-50">বাতিল</button>
                  </>
                )}
                <button disabled={busy} onClick={() => setDelId(r.id)} className="text-xs font-bold bg-red-50 text-red-700 rounded-lg px-3 py-1.5 transition disabled:opacity-50">🗑 মুছুন</button>
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={!!delId} onClose={() => setDelId(null)} title="অনুরোধ মুছবেন?">
        <p className="text-sm text-gray-600 mb-3">মুছে ফেললে এটি সবার তালিকা থেকে চলে যাবে। এই কাজ ফেরানো যায় না।</p>
        <div className="flex gap-2">
          <button onClick={() => setDelId(null)} className="btn-outline flex-1 !py-2.5">থাক</button>
          <button onClick={remove} className="btn-blood flex-1 !py-2.5">হ্যাঁ, মুছুন</button>
        </div>
      </Modal>
      <Toast msg={toast} />
    </DashShell>
  );
}
