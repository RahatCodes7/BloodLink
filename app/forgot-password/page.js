'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Toast, Modal, Input } from '@/components/ui';
import Icon, { FlatIcon } from '@/components/icons';
import Reveal from '@/components/Reveal';
import { isValidBDPhone } from '@/lib/utils';

const isFbOn = () => Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const fbMod = () => import('@/lib/firebase');

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [idToken, setIdToken] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [cool, setCool] = useState(0);

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2400); }

  async function sendCode(e) {
    e.preventDefault();
    if (!isValidBDPhone(phone)) return say('সঠিক ফোন নম্বর দিন।');
    if (!isFbOn()) return say('OTP সার্ভার কনফিগার হয়নি।');
    setBusy(true);
    try {
      const { toE164BD, sendFirebaseOtp, resetVerifier, firebaseErrorBn } = await fbMod();
      try {
        const conf = await sendFirebaseOtp(toE164BD(phone.trim()));
        setConfirmation(conf); setOtpOpen(true); setCode(''); setCool(60);
        const t = setInterval(() => setCool(c => { if (c <= 1) clearInterval(t); return c - 1; }), 1000);
      } catch (err) {
        resetVerifier();
        say(firebaseErrorBn(err.code));
      }
    } catch { say('OTP পাঠানো যায়নি।'); }
    setBusy(false);
  }

  async function verifyCode() {
    if (!confirmation || code.trim().length < 6) return say('৬ সংখ্যার কোড দিন।');
    setBusy(true);
    try {
      const res = await confirmation.confirm(code.trim());
      const token = await res.user.getIdToken();
      setIdToken(token); setOtpOpen(false); setStep(2);
    } catch (e) {
      const { firebaseErrorBn } = await fbMod();
      say(firebaseErrorBn(e.code));
    }
    setBusy(false);
  }

  async function reset(e) {
    e.preventDefault();
    if (pw.length < 6) return say('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।');
    setBusy(true);
    try {
      const r = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, newPassword: pw, idToken }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'রিসেট ব্যর্থ');
      say('✓ পাসওয়ার্ড বদলে গেছে! লগইন করুন।');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) { say(err.message); }
    setBusy(false);
  }

  return (
    <div className="pt-6 pb-4">
      <Reveal>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-soft border border-gray-100 bg-white">
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-blood-700 via-blood-600 to-blood-800 text-white p-8 overflow-hidden">
            <img src="/icons/blood-badge.png" alt="" aria-hidden="true" draggable={false} className="absolute -right-6 -bottom-6 w-48 opacity-90 animate-floaty pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <img src="/icons/blood-hero.png" alt="" className="w-10 h-10" draggable={false} />
                <p className="font-extrabold text-xl">BloodLink</p>
              </div>
              <h2 className="text-3xl font-extrabold mt-6 leading-tight">পাসওয়ার্ড<br />রিসেট করুন 🔑</h2>
              <p className="text-white/85 text-sm mt-2">ফোনে OTP যাবে,<br />তারপর নতুন পাসওয়ার্ড দিন।</p>
            </div>
            <div className="relative flex gap-2 text-[11px] font-bold">
              {['১. ফোন যাচাই', '২. নতুন পাসওয়ার্ড'].map((s, i) => (
                <span key={s} className={`rounded-full px-3 py-1.5 ${step > i ? 'bg-white text-blood-700' : 'bg-white/15'}`}>{s}</span>
              ))}
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="md:hidden flex justify-center mb-2"><FlatIcon src="blood-badge.png" alt="" className="w-16 h-16 animate-floaty-sm" /></div>
            <h1 className="text-2xl font-extrabold text-center md:text-left">পাসওয়ার্ড ভুলে গেছেন?</h1>
            <p className="text-sm text-gray-500 mb-5 text-center md:text-left">{step === 1 ? 'ধাপ ১: ফোন নম্বর যাচাই' : 'ধাপ ২: নতুন পাসওয়ার্ড'}</p>
            {step === 1 ? (
              <form onSubmit={sendCode}>
                <label className="block mb-3"><span className="label">ফোন নম্বর (অ্যাকাউন্টের)</span>
                  <span className="relative block">
                    <Icon name="phone" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input className="input !pl-11" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" />
                  </span>
                </label>
                <Button loading={busy} className="!py-3.5">{busy ? 'কোড পাঠানো হচ্ছে...' : 'OTP পাঠান'}</Button>
              </form>
            ) : (
              <form onSubmit={reset}>
                <label className="block mb-3"><span className="label">ইমেইল</span>
                  <span className="relative block">
                    <Icon name="user" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input className="input !pl-11" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                  </span>
                </label>
                <label className="block mb-4"><span className="label">নতুন পাসওয়ার্ড</span>
                  <span className="relative block">
                    <Icon name="clip" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input className="input !pl-11 !pr-14" type={show ? 'text' : 'password'} required value={pw} onChange={e => setPw(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blood-700">{show ? 'লুকান' : 'দেখুন'}</button>
                  </span>
                </label>
                <Button loading={busy} className="!py-3.5">{busy ? 'বদলানো হচ্ছে...' : 'পাসওয়ার্ড বদলান'}</Button>
              </form>
            )}
            <p className="text-sm mt-4 text-center md:text-left"><Link href="/login" className="text-blood-700 font-bold hover:underline">← লগইনে ফিরুন</Link></p>
          </div>
        </div>
      </Reveal>
      <Modal open={otpOpen} onClose={() => setOtpOpen(false)} title="OTP যাচাই">
        <p className="text-sm text-gray-500 mb-1">{phone} নম্বরে কোড গেছে।</p>
        <Input label="৬ সংখ্যার কোড" value={code} onChange={e => setCode(e.target.value)} placeholder="------" inputMode="numeric" maxLength={6} />
        <Button loading={busy} onClick={verifyCode}>যাচাই করুন</Button>
      </Modal>
      <div id="recaptcha-container" />
      <Toast msg={toast} />
    </div>
  );
}
