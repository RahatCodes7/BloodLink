'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { hospitalsByDistrict, hospName } from '@/lib/locations';
import { isValidBDPhone } from '@/lib/utils';
import BloodGroupSelector from '@/components/BloodGroupSelector';
import LocationSelector from '@/components/LocationSelector';
import { Card, Input, Textarea, Toast } from '@/components/ui';
import { cn } from '@/lib/utils';

const steps = ['গ্রুপ', 'ব্যাগ', 'জরুরি', 'লোকেশন', 'সময়', 'যোগাযোগ', 'তথ্য', 'নিশ্চিত'];

export default function NewRequest() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [f, setF] = useState({ blood: '', bags: 1, urgency: 'urgent', division: '', district: '', upazila: '', hospital: '', customPlace: '', date: '', time: '', phone: '', wa: true, desc: '', agree: false });

  useEffect(() => { ensureSeed(); if (!store.getUser()) router.push('/login'); }, [router]);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  function next() {
    if (step === 0 && !f.blood) return say('রক্তের গ্রুপ নির্বাচন করুন।');
    if (step === 3 && (!f.division || !f.district)) return say('বিভাগ ও জেলা নির্বাচন করুন।');
    if (step === 4 && !f.date) return say('প্রয়োজনের তারিখ দিন।');
    if (step === 5 && !isValidBDPhone(f.phone)) return say('সঠিক ফোন নম্বর দিন (01XXXXXXXXX)।');
    setStep(s => Math.min(s + 1, 7));
  }
  async function publish() {
    if (!f.agree) return say('অনুগ্রহ করে নিশ্চিত করুন যে তথ্য সত্য।');
    setPublishing(true);
    const hosp = hospName(f.hospital) || f.customPlace || 'অন্যান্য স্থান';
    const payload = {
      blood_group: f.blood, bags_required: f.bags, urgency: String(f.urgency || 'urgent').toUpperCase(),
      required_date: f.date, required_time: f.time || null,
      division_id: f.division, district_id: f.district, upazila_id: f.upazila || null,
      location_text: hosp, description: (f.desc || '').slice(0, 500),
      contact_phone: f.phone.trim(), whatsapp_available: f.wa
    };
    let id = null;
    try {
      const r = await fetch('/api/blood-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'প্রকাশ ব্যর্থ');
      id = j.data.id;
    } catch (e) {
      // DB/API না থাকলে local fallback (demo):
      if (String(e.message).includes('Failed to fetch') || String(e.message).includes('DATABASE_URL')) id = Math.random().toString(36).slice(2, 7).toUpperCase();
      else { setPublishing(false); say(e.message); return; }
    }
    const r = { id, blood_group: f.blood, bags_required: f.bags, bags_fulfilled: 0, urgency: f.urgency, division_id: f.division, district_id: f.district, upazila_id: f.upazila, hospital: hosp, location_text: hosp, required_date: f.date, required_time: f.time, description: f.desc.slice(0, 500), contact_phone: f.phone, whatsapp_enabled: f.wa, status: 'ACTIVE', verified_requester: true, created_at: new Date().toISOString() };
    store.addRequest(r);
    store.pushNotif({ title: '✓ অনুরোধ প্রকাশ হয়েছে', message: `${r.blood_group} • ${r.bags_required} ব্যাগ • ${hosp}`, ref: r.id });
    say('✓ আপনার রক্তের অনুরোধ সফলভাবে প্রকাশ হয়েছে।');
    setTimeout(() => router.push('/request/' + id), 900);
  }

  return (
    <div className="pt-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-extrabold">রক্তের অনুরোধ করুন</h1>
      <div className="flex gap-1 overflow-x-auto" aria-label="ধাপ">
        {steps.map((s, i) => <span key={s} className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap', i === step ? 'bg-blood-600 text-white' : i < step ? 'bg-green-100 text-green-800' : 'bg-gray-100')}>{i + 1}. {s}</span>)}
      </div>
      <Card>
        {step === 0 && (<><p className="label">কোন রক্তের গ্রুপ প্রয়োজন?</p><BloodGroupSelector value={f.blood} onChange={v => setF({ ...f, blood: v })} /></>)}
        {step === 1 && (<><p className="label">কত ব্যাগ প্রয়োজন?</p><div className="flex items-center gap-4 justify-center py-4">
          <button className="w-12 h-12 rounded-full border-2 font-extrabold text-xl" onClick={() => setF({ ...f, bags: Math.max(1, f.bags - 1) })} aria-label="কমান">-</button>
          <span className="text-4xl font-extrabold text-blood-700">{f.bags}</span>
          <button className="w-12 h-12 rounded-full border-2 font-extrabold text-xl" onClick={() => setF({ ...f, bags: Math.min(10, f.bags + 1) })} aria-label="বাড়ান">+</button></div>
          <p className="text-xs text-gray-400 text-center">সর্বোচ্চ ১০ ব্যাগ</p></>)}
        {step === 2 && (<><p className="label">জরুরি অবস্থা</p>{[['normal', '🟢 সাধারণ'], ['urgent', '🟠 জরুরি'], ['critical', '🔴 অত্যন্ত জরুরি']].map(([v, l]) => (
          <label key={v} className={cn('flex items-center gap-2 border-2 rounded-xl px-4 py-3 mb-2 cursor-pointer', f.urgency === v ? 'border-blood-600 bg-blood-50' : '')}>
            <input type="radio" name="urg" checked={f.urgency === v} onChange={() => setF({ ...f, urgency: v })} /><span className="font-bold">{l}</span></label>))}</>)}
        {step === 3 && (<><LocationSelector division={f.division} district={f.district} upazila={f.upazila} onChange={o => setF({ ...f, ...o, hospital: '' })} />
          <label className="label mt-2">হাসপাতাল / স্থান {f.district ? `(${hospitalsByDistrict(f.district).length}টি)` : ''}</label>
          <select className="input mb-2" value={f.hospital} onChange={e => setF({ ...f, hospital: e.target.value })}>
            <option value="">{f.district ? 'হাসপাতাল বেছে নিন' : 'আগে জেলা নির্বাচন করুন'}</option>
            {hospitalsByDistrict(f.district).map(h => <option key={h.id} value={h.id}>{h.name_bn}{h.verified ? ' ✓' : ''}</option>)}
            <option value="other">অন্যান্য স্থান</option>
          </select>
          {(f.hospital === 'other' || !f.hospital) && <Input label="স্থানের নাম লিখুন" value={f.customPlace} onChange={e => setF({ ...f, customPlace: e.target.value })} placeholder="যেমন: উপজেলা স্বাস্থ্য কমপ্লেক্স" />}</>)}
        {step === 4 && (<><div className="grid grid-cols-2 gap-2"><Input label="তারিখ" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /><Input label="সময়" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} placeholder="যেমন: সকাল ১০টা" /></div></>)}
        {step === 5 && (<><Input label="ফোন নম্বর" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="numeric" />
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={f.wa} onChange={e => setF({ ...f, wa: e.target.checked })} className="w-5 h-5 accent-red-600" />WhatsApp-এ যোগাযোগ করা যাবে</label></>)}
        {step === 6 && (<Textarea label="অতিরিক্ত তথ্য" value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="রোগীর অবস্থা, ওয়ার্ড নম্বর ইত্যাদি (সংক্ষেপে)" />)}
        {step === 7 && (<><label className="flex gap-2 items-start bg-gray-50 rounded-xl p-3 text-sm font-semibold"><input type="checkbox" checked={f.agree} onChange={e => setF({ ...f, agree: e.target.checked })} className="w-5 h-5 mt-0.5 accent-red-600" />আমি নিশ্চিত করছি যে এই রক্তের অনুরোধটি সত্য এবং প্রয়োজনীয় তথ্য সঠিক।</label>
          <button className="btn-blood mt-3 inline-flex items-center justify-center gap-2" disabled={publishing} onClick={publish}>
            {publishing ? <><span className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full animate-spin" />প্রকাশ করা হচ্ছে...</> : 'রক্তের অনুরোধ প্রকাশ করুন'}</button></>)}
        <div className="flex gap-2 mt-4">
          {step > 0 && <button className="btn-outline flex-1" onClick={() => setStep(s => s - 1)}>← পেছনে</button>}
          {step < 7 && <button className="btn-blood flex-1" onClick={next}>পরবর্তী →</button>}
        </div>
      </Card>
      <Toast msg={toast} />
    </div>
  );
}
