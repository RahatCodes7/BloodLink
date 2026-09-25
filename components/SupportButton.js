'use client';
import { useState } from 'react';
import { SUPPORT, COSTS } from '@/lib/support';
import { Modal } from './ui';
import Icon from './icons';

// ভাসমান "সাপোর্ট করুন" বাটন + ডোনেশন মোডাল (bKash/নগদ/রকেট + BuyMeACoffee)
export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState('');
  function copy(num, tag) {
    navigator.clipboard?.writeText(num).catch(() => {});
    setCopied(tag);
    setTimeout(() => setCopied(''), 1800);
  }
  const methods = [['bKash', SUPPORT.bkash, 'text-pink-600'], ['Nagad', SUPPORT.nagad, 'text-orange-500'], ['Rocket', SUPPORT.rocket, 'text-purple-600']];
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="BloodLink-এর পাশে থাকুন"
        className="fixed bottom-20 md:bottom-6 right-4 z-40 group flex items-center gap-2 bg-gradient-to-r from-blood-600 to-blood-700 text-white font-bold text-sm pl-3 pr-4 py-2.5 rounded-full shadow-soft animate-pulse-ring hover:scale-105 active:scale-95 transition">
        <Icon name="heart" className="w-5 h-5 animate-floaty-sm" />
        <span className="hidden sm:inline">পাশে থাকুন</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="❤️ পাশে থাকুন">
        <p className="text-sm text-gray-600 mb-3">আপনার অনুদান প্ল্যাটফর্মটি সচল রাখে। কোনো লাভের জন্য নয়।</p>
        <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
          {COSTS.map(([t, d]) => <p key={t} className="text-xs"><b>{t}:</b> <span className="text-gray-500">{d}</span></p>)}
        </div>
        <p className="label">মোবাইল ব্যাংকিং (Send Money)</p>
        <div className="space-y-2 mb-3">
          {methods.map(([label, num, cls]) => (
            <div key={label} className="flex items-center justify-between border rounded-xl px-3 py-2.5">
              <div><p className={`font-extrabold text-sm ${cls}`}>{label}</p><p className="font-mono font-bold tracking-wider">{num}</p></div>
              <button onClick={() => copy(num, label)} className="text-xs font-bold bg-gray-100 hover:bg-red-50 hover:text-blood-700 rounded-lg px-3 py-1.5 transition">
                {copied === label ? '✓ কপি হয়েছে' : 'কপি'}
              </button>
            </div>
          ))}
        </div>
        <a href={SUPPORT.buyMeACoffee} target="_blank" rel="noreferrer" className="btn-blood w-full text-center !py-2.5 !bg-yellow-500 hover:!bg-yellow-600 block">
          ☕ Buy Me a Coffee
        </a>
        <p className="text-[11px] text-gray-400 mt-2 text-center">{SUPPORT.bdtNote}</p>
      </Modal>
    </>
  );
}
