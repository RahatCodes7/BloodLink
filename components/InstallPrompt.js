'use client';
import { useEffect, useState } from 'react';
import Icon from './icons';

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
