'use client';
import { useEffect, useState } from 'react';
import { pushSupported, pushPermission, enablePush, wasPushEnabled, dismissPushPrompt, pushPromptSnoozed } from '@/lib/push';
import Icon from './icons';

// সাইটে ঢুকলে নোটিফিকেশন ON করতে বলা — জরুরি রক্তের খবর ফোনে পেতে
export default function PushPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!pushSupported()) return;
    // ?push=test দিলে জোর করে দেখাবে (ডিবাগ):
    let force = false;
    try { force = new URLSearchParams(window.location.search).get('push') === 'test'; } catch {}
    if (!force) {
      if (wasPushEnabled() || pushPromptSnoozed()) return;
      if (pushPermission() !== 'default') return;
    }
    const t = setTimeout(() => setShow(true), 2500); // ২.৫s পর ভদ্রভাবে জিজ্ঞেস
    return () => clearTimeout(t);
  }, []);

  async function on() {
    setBusy(true); setMsg('');
    try {
      await enablePush();
      setShow(false);
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }
  function later() { dismissPushPrompt(); setShow(false); }

  if (!show) return null;
  return (
    <div className="fixed bottom-32 md:bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 animate-pop-in" role="dialog" aria-label="নোটিফিকেশন চালু করুন">
      <div className="card !p-4 border-2 !border-blood-100 shadow-soft">
        <div className="flex gap-3">
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-blood-600 text-white flex items-center justify-center animate-pulse-ring">
            <Icon name="bell" className="w-6 h-6" />
          </span>
          <div className="flex-1">
            <p className="font-extrabold">🔔 জরুরি নোটিফিকেশন চালু করুন?</p>
            <p className="text-xs text-gray-500 mt-0.5">আপনার এলাকায় জরুরি রক্ত লাগলেই ফোনে খবর যাবে — সাইট বন্ধ থাকলেও।</p>
            {msg && <p className="text-xs text-red-600 font-bold mt-1">{msg}</p>}
            <div className="flex gap-2 mt-2.5">
              <button onClick={on} disabled={busy} className="btn-blood !w-auto !py-2 !px-4 text-sm flex-1">
                {busy ? 'চালু হচ্ছে...' : 'চালু করুন'}
              </button>
              <button onClick={later} className="text-xs font-bold text-gray-400 px-2">পরে</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
