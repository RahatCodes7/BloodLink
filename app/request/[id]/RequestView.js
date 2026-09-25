'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { fetchRequest } from '@/lib/api';
import { URGENCY_LABEL, STATUS_LABEL, REPORT_REASONS } from '@/lib/constants';
import { divName, disName, upaName } from '@/lib/locations';
import { telLink, waLink, shareMessage } from '@/lib/utils';
import { Card, Badge, Modal, Input, Textarea, Toast, EmptyState } from '@/components/ui';
import { urgencyTone } from '@/components/RequestCard';

export default function RequestDetails({ id }) {
  const [r, setR] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [desc, setDesc] = useState('');

  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try { const row = await fetchRequest(id); if (live) setR(row); }
      catch { if (live) setR(store.getRequest(id) || null); }
    })();
    setSaved(store.getSaved().includes(id));
    return () => { live = false; };
  }, [id]);

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  const [saveBusy, setSaveBusy] = useState(false);
  async function toggleSave() {
    const next = !saved;
    setSaved(next); // সাথে সাথে UI
    store.toggleSave(r.id); // local cache
    if (!store.getUser()) return;
    setSaveBusy(true);
    try {
      const res = await fetch('/api/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: r.id }) });
      const j = await res.json();
      if (j.ok) { setSaved(j.data.saved); say(j.data.saved ? '✓ অনুরোধটি সংরক্ষণ করা হয়েছে।' : 'সংরক্ষণ বাতিল হয়েছে।'); }
    } catch {}
    setSaveBusy(false);
  }
  async function submitReport() {
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: r.id, reason, description: desc }) });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'রিপোর্ট জমা হয়নি');
    } catch (e) {
      if (!String(e.message || '').includes('Failed to fetch')) { say(e.message); return; }
      store.addReport({ request_id: r.id, reason, description: desc, reporter: store.getUser()?.name || 'অতিথি' });
    }
    setReportOpen(false); setDesc(''); say('রিপোর্ট জমা হয়েছে। ধন্যবাদ।');
  }
  if (r === null) return <div className="pt-6"><EmptyState title="অনুরোধটি পাওয়া যায়নি।" hint="লিংকটি ঠিক আছে কি না দেখুন।" /></div>;
  if (!r) return <div className="pt-6">প্রোফাইল লোড হচ্ছে...</div>;

  const showPhone = r.contact_phone;
  return (
    <div className="pt-4 space-y-4 max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center justify-between">
          <Badge tone={urgencyTone(r.urgency)}>{URGENCY_LABEL[r.urgency]}</Badge>
          <Badge tone="gray">{STATUS_LABEL[r.status] || r.status}</Badge>
        </div>
        <h1 className="text-2xl font-extrabold mt-2">{r.blood_group} রক্ত প্রয়োজন • {r.bags_required} ব্যাগ</h1>
        <dl className="mt-3 space-y-2 text-[15px]">
          {[['রক্তের গ্রুপ', r.blood_group], ['প্রয়োজন', `${r.bags_required} ব্যাগ`], ['জরুরি অবস্থা', URGENCY_LABEL[r.urgency]],
            ['হাসপাতাল', r.hospital || r.location_text], ['বিভাগ', divName(r.division_id)], ['জেলা', disName(r.district_id)],
            ['উপজেলা', upaName(r.upazila_id)], ['প্রয়োজনের তারিখ', r.required_date], ['প্রয়োজনের সময়', r.required_time],
            ['অতিরিক্ত তথ্য', r.description || '—']].map(([k, v]) => (
            <div key={k} className="flex gap-2 border-b border-gray-50 pb-1.5"><dt className="w-32 shrink-0 text-gray-500 font-semibold">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        <p className="text-xs text-gray-500 mt-2">অনুরোধকারী: {r.verified_requester ? '✓ যাচাইকৃত ব্যবহারকারী' : 'ব্যবহারকারী'}</p>
      </Card>

      <div className={`grid gap-2 sticky bottom-16 md:static ${r.whatsapp_enabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <a className="btn-blood text-center" href={telLink(showPhone)}>📞 কল করুন</a>
        {r.whatsapp_enabled
          && <a className="btn-blood text-center !bg-green-600 hover:!bg-green-700" target="_blank" rel="noreferrer" href={waLink(showPhone, `আসসালামু আলাইকুম, ${r.blood_group} রক্তের অনুরোধ (${r.id}) দেখে যোগাযোগ করছি।`)}>💬 WhatsApp-এ SMS</a>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="btn-outline !px-2 text-sm" onClick={() => { const m = shareMessage(r); navigator.clipboard?.writeText(m).catch(() => {}); if (navigator.share) navigator.share({ title: 'রক্ত প্রয়োজন', text: m }).catch(() => {}); say('লিংক কপি হয়েছে ✓'); }}>🔗 শেয়ার</button>
        <button disabled={saveBusy} className="btn-outline !px-2 text-sm" onClick={toggleSave}>{saved ? '✓ সংরক্ষিত' : '🔖 সংরক্ষণ'}</button>
        <button className="btn-outline !px-2 text-sm" onClick={() => setReportOpen(true)}>⚠️ রিপোর্ট</button>
      </div>
      <div className="flex gap-2 text-sm">
        <a className="flex-1 card p-2.5 text-center font-bold hover:bg-gray-50" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(shareMessage(r))}`}>WhatsApp-এ শেয়ার</a>
        <a className="flex-1 card p-2.5 text-center font-bold hover:bg-gray-50" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}>Facebook-এ শেয়ার</a>
      </div>
      <p className="text-xs text-gray-400">⚠️ নিরাপত্তা: অপরিচিত নম্বরে অগ্রিম টাকা দেবেন না। হাসপাতাল/ব্লাড ব্যাংকের নিয়ম অনুসরণ করুন।</p>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="⚠️ রিপোর্ট করুন">
        <label className="label">কারণ</label>
        <select className="input mb-3" value={reason} onChange={e => setReason(e.target.value)}>{REPORT_REASONS.map(x => <option key={x}>{x}</option>)}</select>
        <Textarea label="বিস্তারিত (ঐচ্ছিক)" value={desc} onChange={e => setDesc(e.target.value)} placeholder="সংক্ষেপে লিখুন..." />
        <button className="btn-blood" onClick={submitReport}>জমা দিন</button>
      </Modal>
      <Toast msg={toast} />
    </div>
  );
}
