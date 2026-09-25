'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { BLOOD_GROUPS } from '@/lib/constants';
import { isValidBDPhone } from '@/lib/utils';
import BloodGroupSelector from '@/components/BloodGroupSelector';
import LocationSelector from '@/components/LocationSelector';
import { Card, Input, Select, Button, Toast } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function BecomeDonor() {
  const router = useRouter();
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ name: '', phone: '', wa: true, blood: 'O+', division: '', district: '', upazila: '', available: true, last: '' });
  useEffect(() => { ensureSeed(); const u = store.getUser(); if (u) setF(v => ({ ...v, name: u.name || '', phone: u.phone || '' })); }, []);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  async function submit(e) {
    e.preventDefault();
    if (!store.getUser()) { router.push('/login'); return; }
    if (f.name.trim().length < 3) return say('সঠিক নাম দিন।');
    if (!isValidBDPhone(f.phone)) return say('সঠিক ফোন নম্বর দিন।');
    if (!f.blood || !f.district) return say('গ্রুপ ও জেলা নির্বাচন করুন।');
    if (!f.upazila) return say('উপজেলা নির্বাচন করুন (আবশ্যক)।');
    setLoading(true);
    try {
      const r = await fetch('/api/donors/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: f.blood, division_id: f.division || null, district_id: f.district,
          upazila_id: f.upazila || null, availability_status: f.available ? 'AVAILABLE' : 'UNAVAILABLE',
          emergency_available: true, contact_preference: 'contact', phone: f.phone.trim()
        }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'প্রোফাইল তৈরি ব্যর্থ');
    } catch (err) {
      const noDb = String(err.message).includes('Failed to fetch') || String(err.message).includes('DATABASE_URL');
      if (!noDb) { setLoading(false); say(err.message); return; }
      // DB না থাকলে local fallback (demo)
    }
    store.addDonor({ id: 'd' + Date.now(), name: f.name, phone: f.phone, blood_group: f.blood, division_id: f.division, district_id: f.district, available: f.available, donations: 0, last_donation: f.last });
    say('✓ রক্তদাতা প্রোফাইল তৈরি হয়েছে!');
    setTimeout(() => router.push('/donors'), 900);
  }
  return (
    <div className="pt-4 max-w-xl mx-auto">
      <Card>
        <h1 className="text-2xl font-extrabold">রক্তদাতা হিসেবে যুক্ত হন ❤️</h1>
        <p className="text-sm text-gray-500 mb-4">জরুরি মুহূর্তে কারো পাশে দাঁড়ান</p>
        <form onSubmit={submit}>
          <Input label="নাম" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <Input label="ফোন" required value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="numeric" />
          <label className="flex items-center gap-2 text-sm font-bold mb-3"><input type="checkbox" checked={f.wa} onChange={e => setF({ ...f, wa: e.target.checked })} className="w-5 h-5 accent-red-600" />WhatsApp-এ যোগাযোগ করা যাবে</label>
          <p className="label">রক্তের গ্রুপ</p>
          <div className="mb-3"><BloodGroupSelector value={f.blood} onChange={v => setF({ ...f, blood: v })} /></div>
          <LocationSelector division={f.division} district={f.district} upazila={f.upazila} onChange={o => setF({ ...f, ...o })} />
          <p className="label mt-2">বর্তমান অবস্থা</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button type="button" onClick={() => setF({ ...f, available: true })} className={cn('rounded-xl border-2 py-2.5 font-bold text-sm', f.available ? 'border-green-600 bg-green-50' : '')}>🟢 রক্ত দিতে প্রস্তুত</button>
            <button type="button" onClick={() => setF({ ...f, available: false })} className={cn('rounded-xl border-2 py-2.5 font-bold text-sm', !f.available ? 'border-gray-500 bg-gray-100' : '')}>⚪ বর্তমানে উপলভ্য নই</button>
          </div>
          <Input label="শেষ রক্তদানের তারিখ (ঐচ্ছিক)" type="date" value={f.last} onChange={e => setF({ ...f, last: e.target.value })} />
          <Button loading={loading} className="hidden md:inline-flex">{loading ? 'যুক্ত হচ্ছে...' : 'যুক্ত হোন'}</Button>
        </form>
        <p className="text-xs text-gray-400 mt-3">নোট: রক্তদানের উপযুক্ততা সম্পর্কে চূড়ান্ত সিদ্ধান্ত সংশ্লিষ্ট চিকিৎসক/স্বাস্থ্যসেবা প্রদানকারীর।</p>
      </Card>
      {/* মোবাইলে sticky সাবমিট — নিচে স্ক্রল না করেই যুক্ত হওয়া যায় */}
      <div className="md:hidden sticky bottom-16 z-30 bg-[#fafafa]/95 backdrop-blur py-2.5 border-t mt-3 -mx-4 px-4">
        <Button loading={loading} onClick={submit}>{loading ? 'যুক্ত হচ্ছে...' : '❤️ যুক্ত হোন'}</Button>
      </div>
      <Toast msg={toast} />
    </div>
  );
}
