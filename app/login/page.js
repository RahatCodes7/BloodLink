'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { Button, Toast } from '@/components/ui';
import Icon, { FlatIcon } from '@/components/icons';
import Reveal from '@/components/Reveal';

function Field({ icon, label, ...p }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <span className="relative block">
        <Icon name={icon} className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input className="input !pl-11" {...p} />
      </span>
    </label>
  );
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  function demoLogin() {
    ensureSeed();
    store.setUser({ name: email.split('@')[0] || 'ব্যবহারকারী', email, phone: '01700000000', blood_group: 'O+', division_id: 'dhaka', district_id: 'dhaka-d', upazila_id: 'mirpur' });
    router.push('/dashboard');
  }
  async function submit(e) {
    e.preventDefault();
    if (!email || pass.length < 4) return say('সঠিক ইমেইল ও পাসওয়ার্ড দিন।');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'লগইন ব্যর্থ');
      ensureSeed();
      store.setUser({ ...j.data, phone: j.data.phone || '01700000000' });
      router.push('/dashboard');
    } catch (err) {
      if (String(err.message).includes('Failed to fetch')) { demoLogin(); return; }
      say(err.message); setLoading(false);
    }
  }

  return (
    <div className="pt-6 pb-4">
      <Reveal>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-soft border border-gray-100 bg-white">
          {/* ব্র্যান্ড প্যানেল */}
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-blood-700 via-blood-600 to-blood-800 text-white p-8 overflow-hidden">
            <img src="/icons/blood-double.png" alt="" aria-hidden="true" draggable={false} className="absolute -right-6 -bottom-6 w-52 opacity-90 animate-floaty pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <img src="/icons/blood-hero.png" alt="" className="w-10 h-10" draggable={false} />
                <p className="font-extrabold text-xl">BloodLink</p>
              </div>
              <h2 className="text-3xl font-extrabold mt-6 leading-tight">ফিরে আসায়<br />খুশি হলাম 👋</h2>
              <p className="text-white/85 text-sm mt-2">লগইন করে অনুরোধ করুন,<br />ডোনারদের পাশে দাঁড়ান।</p>
            </div>
            <ul className="relative space-y-2 text-sm font-semibold">
              {[['shield', 'যাচাইকৃত অনুরোধ'], ['chat', 'সরাসরি যোগাযোগ'], ['heart', 'সম্পূর্ণ বিনামূল্যে']].map(([ic, t]) => (
                <li key={t} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm"><Icon name={ic} className="w-5 h-5" />{t}</li>
              ))}
            </ul>
          </div>
          {/* ফর্ম */}
          <div className="p-6 sm:p-8">
            <div className="md:hidden flex justify-center mb-2"><FlatIcon src="blood-hero.png" alt="" className="w-16 h-16 animate-floaty-sm" /></div>
            <h1 className="text-2xl font-extrabold text-center md:text-left">লগইন</h1>
            <p className="text-sm text-gray-500 mb-5 text-center md:text-left">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
            <form onSubmit={submit}>
              <Field icon="user" label="ইমেইল" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              <label className="block mb-4">
                <span className="label">পাসওয়ার্ড</span>
                <span className="relative block">
                  <Icon name="clip" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input className="input !pl-11 !pr-16" type={show ? 'text' : 'password'} required value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blood-700">{show ? 'লুকান' : 'দেখুন'}</button>
                </span>
              </label>
              <Button loading={loading} className="!py-3.5 text-base">{loading ? 'প্রবেশ করছি...' : 'লগইন করুন'}</Button>
            </form>
            <button className="btn-outline w-full mt-2.5 !py-3 inline-flex items-center justify-center gap-2" onClick={() => { ensureSeed(); store.setUser({ name: 'গুগল ব্যবহারকারী', email: 'user@gmail.com', phone: '01700000000', blood_group: 'O+' }); router.push('/dashboard'); }}>
              <span className="w-5 h-5 rounded-full bg-white border flex items-center justify-center font-extrabold text-sm bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">G</span>
              Google দিয়ে চালিয়ে যান
            </button>
            <div className="text-sm mt-4 flex justify-between">
              <Link href="/register" className="text-blood-700 font-bold hover:underline">নতুন অ্যাকাউন্ট খুলুন →</Link>
              <span className="text-gray-400">পাসওয়ার্ড ভুলে গেছেন?</span>
            </div>
          </div>
        </div>
      </Reveal>
      <Toast msg={toast} />
    </div>
  );
}
