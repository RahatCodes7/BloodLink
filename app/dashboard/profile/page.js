'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { BLOOD_GROUPS } from '@/lib/constants';
import { isValidBDPhone } from '@/lib/utils';
import { requestOtp, verifyOtp, isPhoneVerified } from '@/lib/otp';
const isFbOn = () => Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const fbMod = () => import('@/lib/firebase'); // Firebase SDK শুধু দরকারে লোড (bundle হালকা)
import { DashShell } from '../page';
import { Card, Input, Select, Toast, Modal, Button } from '@/components/ui';

export default function Profile() {
  const [f, setF] = useState({ name: '', email: '', phone: '', blood: 'O+', privacy: 'contact' });
  const [toast, setToast] = useState('');
  const [verified, setVerified] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [confirmation, setConfirmation] = useState(null); // Firebase ConfirmationResult
  const [viaFirebase, setViaFirebase] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    ensureSeed();
    const u = store.getUser();
    if (u) {
      setF({ name: u.name || '', email: u.email || '', phone: u.phone || '', blood: u.blood_group || 'O+', privacy: 'contact' });
      setVerified(isPhoneVerified(u.phone));
    }
  }, []);

  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  function save(e) {
    e.preventDefault();
    store.setUser({ ...(store.getUser() || {}), name: f.name, email: f.email, phone: f.phone, blood_group: f.blood });
    setVerified(isPhoneVerified(f.phone));
    say('✓ আপনার প্রোফাইল আপডেট হয়েছে।');
  }
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode() {
    if (cooldown > 0) return;
    if (!isValidBDPhone(f.phone)) return say('আগে সঠিক ফোন নম্বর দিন।');
    setSending(true);
    // Firebase থাকলে আসল SMS, না থাকলে ডেমো:
    if (isFbOn()) {
      try {
        const { toE164BD, sendFirebaseOtp } = await fbMod();
        const conf = await sendFirebaseOtp(toE164BD(f.phone.trim()));
        setConfirmation(conf); setViaFirebase(true); setDemoCode('');
        setSending(false); setCooldown(60); setOtpOpen(true); setCode('');
      } catch (e) {
        const { resetVerifier, firebaseErrorBn } = await fbMod();
        resetVerifier();
        setSending(false);
        say(firebaseErrorBn(e.code));
      }
      return;
    }
    setTimeout(() => {
      const c = requestOtp(f.phone.trim());
      setConfirmation(null); setViaFirebase(false); setDemoCode(c);
      setSending(false); setCooldown(60); setOtpOpen(true); setCode('');
    }, 700);
  }
  async function confirmCode() {
    if (viaFirebase && confirmation) {
      setVerifying(true);
      try {
        await confirmation.confirm(code.trim());
        setOtpOpen(false); setVerified(true); setVerifying(false);
        say('✓ ফোন নম্বর যাচাই হয়েছে!');
      } catch (e) {
        const { firebaseErrorBn } = await fbMod();
        setVerifying(false);
        say(firebaseErrorBn(e.code));
      }
      return;
    }
    const r = verifyOtp(f.phone.trim(), code);
    if (!r.ok) return say(r.msg);
    setOtpOpen(false); setVerified(true);
    say('✓ ফোন নম্বর যাচাই হয়েছে!');
  }
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <DashShell title="প্রোফাইল">
      <Card><form onSubmit={save}>
        <Input label="নাম" value={f.name} onChange={set('name')} /><Input label="ইমেইল" value={f.email} onChange={set('email')} />
        <Input label="ফোন" value={f.phone} onChange={set('phone')} />
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
          <p className={`text-sm font-bold ${verified ? 'text-green-700' : 'text-orange-600'}`}>
            ফোন যাচাই: {verified ? '✓ যাচাইকৃত' : '○ যাচাই হয়নি'}
          </p>
          {!verified && <button type="button" disabled={cooldown > 0} onClick={sendCode} className="text-xs font-bold text-blood-700 underline disabled:text-gray-400 disabled:no-underline">{cooldown > 0 ? `${cooldown}s পর আবার` : 'কোড পাঠান'}</button>}
        </div>
        <Select label="রক্তের গ্রুপ" value={f.blood} onChange={set('blood')}>{BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}</Select>
        <p className="label mt-3">আমার ফোন নম্বর কে দেখতে পারবে?</p>
        {[['all', 'সবাই'], ['contact', 'শুধু যোগাযোগের সময়'], ['none', 'কেউ না']].map(([v, l]) => (
          <label key={v} className="flex gap-2 text-sm font-semibold mb-1"><input type="radio" name="pr" checked={f.privacy === v} onChange={() => setF({ ...f, privacy: v })} className="accent-red-600" />{l}</label>))}
        <button className="btn-blood mt-3">প্রোফাইল সম্পাদনা করুন</button>
      </form></Card>

      <Modal open={otpOpen} onClose={() => setOtpOpen(false)} title="ফোন যাচাই">
        <p className="text-sm text-gray-500 mb-1">{f.phone} নম্বরে ৬ সংখ্যার কোড পাঠানো হয়েছে।</p>
        {demoCode && <p className="text-xs bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 mb-2">ডেমো মোড: কোড <b className="text-lg tracking-widest">{demoCode}</b> (আসল SMS পরে যুক্ত হবে)</p>}
        {viaFirebase && <p className="text-xs bg-green-50 border border-green-200 rounded-xl p-2.5 mb-2">📲 {f.phone} নম্বরে Firebase থেকে আসল SMS গেছে।</p>}
        <Input label="যাচাই কোড" value={code} onChange={e => setCode(e.target.value)} placeholder="------" inputMode="numeric" maxLength={6} />
        <Button loading={verifying || sending} onClick={confirmCode}>{verifying ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}</Button>
      </Modal>
      <div id="recaptcha-container" />
      <Toast msg={toast} />
    </DashShell>
  );
}
