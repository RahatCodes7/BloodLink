'use client';
import { useEffect, useState } from 'react';
import Icon from './icons';

function isInstalled() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// সাইডে সবসময় থাকা "অ্যাপ" বাটন — prompt না এলেও ইনস্টল করা যায়; ইনস্টলের পর গায়েব
export function InstallButton() {
  const [deferred, setDeferred] = useState(null);
  const [gone, setGone] = useState(true);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('bl_installed')) return; } catch {}
    if (isInstalled()) return;
    setGone(false);
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => {
      try { localStorage.setItem('bl_installed', '1'); } catch {}
      setGone(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function go() {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
      if (outcome === 'accepted') {
        try { localStorage.setItem('bl_installed', '1'); } catch {}
        setGone(true);
      }
      setDeferred(null);
      return;
    }
    setHelp(true); // prompt unavailable (in-app browser/iOS) → manual নির্দেশনা
  }

  if (gone) return null;
  return (
    <>
      <button onClick={go} aria-label="অ্যাপ ইনস্টল করুন"
        className="fixed bottom-20 md:bottom-6 left-4 z-40 flex items-center gap-2 bg-gray-900 text-white font-bold text-sm pl-3 pr-4 py-2.5 rounded-full shadow-soft hover:scale-105 active:scale-95 transition">
        <Icon name="plus" className="w-5 h-5" />
        <span className="hidden sm:inline">অ্যাপ নিন</span>
      </button>
      {help && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setHelp(false)}>
          <div className="bg-white w-full sm:max-w-sm rounded-2xl p-5 animate-pop-in" onClick={e => e.stopPropagation()}>
            <p className="font-extrabold mb-2">📲 অ্যাপ ইনস্টল করুন</p>
            <ul className="text-sm text-gray-600 space-y-1.5 list-disc ml-5">
              <li><b>Chrome:</b> মেনু (⋮) → <b>Add to Home screen</b> / <b>Install app</b></li>
              <li><b>iPhone (Safari):</b> Share → <b>Add to Home Screen</b></li>
              <li>Facebook/Messenger-এর ভেতর খুলে থাকলে লিংক কপি করে Chrome/Safari-তে খুলুন</li>
            </ul>
            <button onClick={() => setHelp(false)} className="btn-blood w-full mt-3 !py-2.5">বুঝেছি</button>
          </div>
        </div>
      )}
    </>
  );
}

// PWA install prompt — Android/Chrome: beforeinstallprompt; iPhone: manual নির্দেশনা
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return; // ইতিমধ্যে ইনস্টলড
    try { if (localStorage.getItem('bl_install_off')) return; } catch {}
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      setIsIos(true);
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
    if (outcome === 'accepted') { setDone(true); setShow(false); }
    setDeferred(null);
  }
  function later() {
    try { localStorage.setItem('bl_install_off', Date.now().toString()); } catch {}
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed top-[68px] left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 animate-pop-in" role="dialog" aria-label="অ্যাপ ইনস্টল করুন">
      <div className="card !p-3.5 border-2 !border-blood-100 shadow-soft">
        <div className="flex gap-3 items-center">
          <img src="/icon-192.png" alt="" className="w-12 h-12 rounded-2xl shrink-0" draggable={false} />
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm">📲 BloodLink অ্যাপ ইনস্টল করুন</p>
            {isIos
              ? <p className="text-xs text-gray-500 mt-0.5">Safari-তে <b>Share → Add to Home Screen</b> চাপুন</p>
              : <p className="text-xs text-gray-500 mt-0.5">হোম স্ক্রিনে রাখুন — দ্রুত খুলবে, পুশ আসবে।</p>}
            <div className="flex gap-2 mt-2">
              {!isIos && <button onClick={install} className="btn-blood !w-auto !py-1.5 !px-4 text-sm flex-1">ইনস্টল</button>}
              <button onClick={later} className="text-xs font-bold text-gray-400 px-2">পরে</button>
            </div>
          </div>
          <button onClick={later} aria-label="বন্ধ করুন" className="self-start text-gray-300 hover:text-gray-500 text-xl leading-none px-1">×</button>
        </div>
      </div>
    </div>
  );
}
