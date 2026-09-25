'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { store, ensureSeed } from '@/lib/store';
import Icon from './icons';
import { Avatar } from './ui';

const items = [
  { href: '/', icon: 'home', label: 'হোম' },
  { href: '/search', icon: 'search', label: 'খুঁজুন' },
  { href: '/request-new', icon: 'drop', label: 'রক্ত চাই', center: true },
  { href: '/dashboard/notifications', icon: 'bell', label: 'নোটিফাই' },
  { href: '#me', icon: 'user', label: 'আমি', sheet: true }
];

const hubLinks = [
  ['/dashboard', 'user', 'ড্যাশবোর্ড'],
  ['/dashboard/requests', 'drop', 'আমার অনুরোধ'],
  ['/dashboard/donor-profile', 'heart', 'রক্তদাতা প্রোফাইল'],
  ['/dashboard/saved', 'bookmark', 'সংরক্ষিত'],
  ['/dashboard/notifications', 'bell', 'নোটিফিকেশন'],
  ['/dashboard/messages', 'chat', 'মেসেজ'],
  ['/campaigns', 'clip', 'ক্যাম্পেইন'],
  ['/compatibility', 'drop', 'সামঞ্জস্য চার্ট'],
  ['/dashboard/profile', 'clip', 'প্রোফাইল সেটিংস']
];

export default function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const [sheet, setSheet] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { ensureSeed(); setUser(store.getUser()); setSheet(false); }, [path]);

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    store.logout(); setSheet(false); router.push('/');
  }

  const meActive = path && path.startsWith('/dashboard');

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-t border-white/40 shadow-[0_-8px_30px_-10px_rgba(185,28,28,.25)] bottom-nav-safe" aria-label="মোবাইল মেনু">
        <div className="grid grid-cols-5">
          {items.map(it => {
            if (it.sheet) {
              const active = meActive || sheet;
              return (
                <button key="me" onClick={() => setSheet(true)}
                  className={cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition', active ? 'text-blood-700' : 'text-gray-500')}>
                  <span className={cn('px-3 py-1 rounded-full transition flex flex-col items-center', active && 'bg-blood-600 text-white shadow-[0_4px_12px_-2px_rgba(185,28,28,.5)]')}><Icon name="user" className="w-6 h-6" /></span>
                  <span className={cn(active && 'text-blood-700')}>আমি</span>
                </button>
              );
            }
            const active = path === it.href;
            return (
              <Link key={it.href + it.label} href={it.href}
                className={cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition', active ? 'text-blood-700' : 'text-gray-500')}>
                {it.center
                  ? <span className="-mt-7 w-14 h-14 rounded-full bg-gradient-to-br from-blood-500 to-blood-800 text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(185,28,28,.6)] border-4 border-white/70 animate-pulse-ring active:scale-95 transition"><Icon name="drop" className="w-7 h-7" /></span>
                  : <span className={cn('px-3 py-1 rounded-full transition flex flex-col items-center', active && 'bg-blood-600 text-white shadow-[0_4px_12px_-2px_rgba(185,28,28,.5)]')}><Icon name={it.icon} className="w-6 h-6" /></span>}
                <span className={cn(active && 'text-blood-700')}>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {sheet && typeof document !== 'undefined' && createPortal(
        <div className="md:hidden fixed inset-0 z-[70]" role="dialog" aria-label="আমার মেনু">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-soft max-h-[75vh] overflow-y-auto animate-pop-in bottom-nav-safe">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-2.5" />
            {user ? (
              <div className="flex items-center gap-3 px-5 pt-3 pb-1">
                <Avatar name={user.name} />
                <div><p className="font-extrabold">{user.name}</p><p className="text-xs text-gray-500">{user.email || user.phone || ''}</p></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-5 pt-4">
                <Link href="/login" className="btn-outline text-center !py-2.5">লগইন</Link>
                <Link href="/register" className="btn-blood text-center !py-2.5">নিবন্ধন</Link>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 p-4">
              {hubLinks.map(([h, ic, l]) => (
                <Link key={h + l} href={h} className="flex flex-col items-center gap-1.5 bg-gray-50 hover:bg-red-50 rounded-2xl py-3.5 px-1 text-center transition">
                  <Icon name={ic} className="w-6 h-6 text-blood-600" />
                  <span className="text-[11px] font-bold leading-tight">{l}</span>
                </Link>
              ))}
            </div>
            {user && (
              <div className="px-4 pb-5">
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl py-2.5">
                  <Icon name="logout" className="w-5 h-5" />লগআউট
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
