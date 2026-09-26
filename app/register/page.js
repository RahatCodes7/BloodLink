'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { BLOOD_GROUPS } from '@/lib/constants';
import { Button, Toast } from '@/components/ui';
import Icon, { FlatIcon } from '@/components/icons';
import Reveal from '@/components/Reveal';
import { isValidBDPhone } from '@/lib/utils';

function Field({ icon, label, children, ...p }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <span className="relative block">
        <Icon name={icon} className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        {children || <input className="input !pl-11 !py-3.5 md:!py-3" {...p} />}
      </span>
    </label>
  );
}

const steps = ['পরিচয়', 'যোগাযোগ', 'রক্তের গ্রুপ'];

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', phone: '', blood: 'O+', pass: '' });
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const done = [f.name.trim().length >= 3, isValidBDPhone(f.phone) && /.+@.+\..+/.test(f.email), f.blood && f.pass.length >= 6].filter(Boolean).length;

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  function fail(m) { setErr(m); setTimeout(() => setErr(''), 2600); }
  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (f.name.trim().length < 3) return fail('সঠিক নাম লিখুন।');
    if (!/.+@.+\..+/.test(f.email)) return fail('সঠিক ইমেইল দিন।');
    if (!isValidBDPhone(f.phone)) return fail('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)।');
    if (f.pass.length < 6) return fail('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone, password: f.pass }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'নিবন্ধন ব্যর্থ');
      ensureSeed();
      store.setUser({ ...j.data, phone: f.phone, blood_group: f.blood });
      say('✓ নিবন্ধন সফল হয়েছে!');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err) {
      if (String(err.message).includes('Failed to fetch')) {
        ensureSeed();
        store.setUser({ name: f.name, email: f.email, phone: f.phone, blood_group: f.blood });
        say('✓ নিবন্ধন সফল হয়েছে! (ডেমো)');
        setTimeout(() => router.push('/dashboard'), 800);
        return;
      }
      fail(err.message); setLoading(false);
    }
  }
  const set = k => e => setF({ ...f, [k]: e.target.value });

  return (
    <div className="pt-6 pb-4">
      <Reveal>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-soft border border-gray-100 bg-white">
          {/* ব্র্যান্ড প্যানেল */}
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-blood-700 via-blood-600 to-blood-800 text-white p-8 overflow-hidden">
            <img src="/icons/donor-hands.png" alt="" aria-hidden="true" draggable={false} className="absolute -right-8 -bottom-8 w-56 opacity-90 animate-floaty pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <img src="/icons/blood-hero.png" alt="" className="w-10 h-10" draggable={false} />
                <p className="font-extrabold text-xl">BloodLink</p>
              </div>
              <h2 className="text-3xl font-extrabold mt-6 leading-tight">মাত্র ১ মিনিটে<br />যুক্ত হোন ❤️</h2>
              <p className="text-white/85 text-sm mt-2">একটি অ্যাকাউন্ট —<br />অনুরোধ, ডোনার প্রোফাইল, সবকিছু।</p>
            </div>
            <div className="relative bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <div className="flex justify-between text-[11px] font-bold mb-1.5">
                {steps.map((s, i) => <span key={s} className={done > i ? 'text-green-300' : 'text-white/70'}>{done > i ? '✓ ' : ''}{s}</span>)}
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full transition-all duration-500" style={{ width: `${(done / 3) * 100}%` }} />
              </div>
              <p className="text-[11px] text-white/75 mt-1.5">ফর্ম পূরণ করলেই প্রগ্রেস বাড়বে</p>
            </div>
          </div>
          {/* ফর্ম */}
          <div className="p-5 sm:p-8">
            <div className="md:hidden flex items-center justify-center gap-2 mb-2">
              <FlatIcon src="donor-hands.png" alt="" className="w-11 h-11" />
              <div className="text-left"><p className="font-extrabold text-blood-700 leading-none">BloodLink</p><p className="text-[11px] text-gray-400">১ মিনিটে যুক্ত হোন ❤️</p></div>
            </div>
            <h1 className="text-[22px] sm:text-2xl font-extrabold text-center md:text-left">নিবন্ধন</h1>
            {/* মোবাইল প্রগ্রেস ডট */}
            <div className="md:hidden flex items-center gap-1.5 mt-2 mb-4" aria-hidden="true">
              {[0, 1, 2].map(i => <span key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${done > i ? 'bg-green-500' : 'bg-gray-200'}`} />)}
            </div>
            <p className="hidden md:block text-sm text-gray-500 mb-5">বিনামূল্যে অ্যাকাউন্ট খুলুন</p>
            {err && <p className="animate-pop-in text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-3">{err}</p>}
            <form onSubmit={submit}>
              <Field icon="user" label="আপনার নাম" required value={f.name} onChange={set('name')} placeholder="যেমন: রহিম উদ্দিন" autoComplete="name" />
              <div className="grid sm:grid-cols-2 gap-2">
                <Field icon="chat" label="ইমেইল" type="email" required value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
                <Field icon="phone" label="ফোন নম্বর" required value={f.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" inputMode="numeric" autoComplete="tel" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <label className="block mb-3">
                  <span className="label">রক্তের গ্রুপ</span>
                  <span className="relative block">
                    <Icon name="drop" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-blood-500 pointer-events-none" />
                    <select className="input !pl-11 !py-3.5 md:!py-3 font-bold text-blood-700" value={f.blood} onChange={set('blood')}>
                      {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </span>
                </label>
                <label className="block mb-3">
                  <span className="label">পাসওয়ার্ড</span>
                  <span className="relative block">
                    <Icon name="clip" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input className="input !pl-11 !pr-14 !py-3.5 md:!py-3" type={show ? 'text' : 'password'} required value={f.pass} onChange={set('pass')} placeholder="কমপক্ষে ৬ অক্ষর" autoComplete="new-password" />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blood-700">{show ? 'লুকান' : 'দেখুন'}</button>
                  </span>
                </label>
              </div>
              <Button loading={loading} className="!py-3.5 text-base">{loading ? 'অ্যাকাউন্ট খোলা হচ্ছে...' : 'নিবন্ধন করুন'}</Button>
            </form>
            <p className="text-sm mt-4 text-center md:text-left">অ্যাকাউন্ট আছে? <Link href="/login" className="text-blood-700 font-bold hover:underline">লগইন করুন →</Link></p>
          </div>
        </div>
      </Reveal>
      <Toast msg={toast} />
    </div>
  );
}
