'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { timeAgo } from '@/lib/utils';
import { Avatar } from './ui';
import Icon from './icons';

const menuItems = [
  ['/dashboard', 'user', 'ড্যাশবোর্ড'],
  ['/dashboard/requests', 'drop', 'আমার অনুরোধ'],
  ['/dashboard/donor-profile', 'heart', 'রক্তদাতা প্রোফাইল'],
  ['/dashboard/saved', 'bookmark', 'সংরক্ষিত'],
  ['/dashboard/profile', 'clip', 'প্রোফাইল সেটিংস']
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [openMenu, setOpenMenu] = useState(null); // 'profile' | 'bell' | null
  const wrapRef = useRef(null);

  useEffect(() => {
    ensureSeed();
    setUser(store.getUser());
    setNotifs(store.getNotif());
    setOpenMenu(null);
  }, [path]);

  useEffect(() => {
    function onDoc(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(null); }
    function onKey(e) { if (e.key === 'Escape') setOpenMenu(null); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    store.logout(); setOpenMenu(null); router.push('/');
  }

  function openBell() {
    setOpenMenu(openMenu === 'bell' ? null : 'bell');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b shadow-[0_1px_12px_-4px_rgba(185,28,28,.15)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/icons/blood-hero.png" alt="BloodLink লোগো" className="w-9 h-9 transition-transform group-hover:scale-110" draggable={false} />
          <span><span className="font-extrabold text-blood-700 text-lg leading-none">BloodLink</span>
          <span className="hidden sm:block text-[11px] text-gray-500">জীবনের প্রয়োজনে, রক্তের বন্ধনে</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold" aria-label="প্রধান মেনু">
          <Link href="/" className="hover:text-blood-700 transition">হোম</Link>
          <Link href="/search" className="hover:text-blood-700 transition">রক্ত খুঁজুন</Link>
          <Link href="/donors" className="hover:text-blood-700 transition">রক্তদাতা</Link>
          <Link href="/request-new" className="hover:text-blood-700 transition">রক্তের অনুরোধ</Link>
          <Link href="/campaigns" className="hover:text-blood-700 transition">ক্যাম্পেইন</Link>
          <Link href="/about" className="hover:text-blood-700 transition">আমাদের সম্পর্কে</Link>
        </nav>
        <div className="flex items-center gap-2" ref={wrapRef}>
          {/* 🔔 নোটিফিকেশন ড্রপডাউন */}
          <div className="relative">
            <button onClick={openBell} className="relative p-2 rounded-xl hover:bg-red-50 text-gray-700 hover:text-blood-700 transition" aria-label="নোটিফিকেশন" aria-expanded={openMenu === 'bell'}>
              <Icon name="bell" className="w-6 h-6" />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-blood-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pop-in">{unread}</span>}
            </button>
            {openMenu === 'bell' && (
              <div className="fixed left-4 right-4 top-[68px] md:absolute md:left-auto md:right-0 md:top-auto md:mt-2 md:w-80 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-pop-in z-50">
                <p className="font-extrabold px-4 pt-3 pb-1">নোটিফিকেশন {unread > 0 && <span className="text-blood-600">({unread} নতুন)</span>}</p>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 && <p className="text-sm text-gray-400 px-4 py-4 text-center">নতুন কোনো নোটিফিকেশন নেই।</p>}
                  {notifs.slice(0, 5).map(n => (
                    <Link key={n.id} href={n.ref ? `/request/${n.ref}` : '/dashboard/notifications'}
                      className={`block px-4 py-2.5 border-b border-gray-50 hover:bg-red-50/50 transition ${!n.is_read ? 'bg-red-50/40' : ''}`}>
                      <p className="text-sm font-bold leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate">{n.message}</p>
                      <p className="text-[11px] text-gray-400">{timeAgo(n.created_at)}</p>
                    </Link>
                  ))}
                </div>
                <Link href="/dashboard/notifications" className="block text-center text-sm font-bold text-blood-700 py-2.5 hover:bg-red-50 transition">সব দেখুন →</Link>
              </div>
            )}
          </div>
          {/* 👤 প্রোফাইল ড্রপডাউন */}
          {user ? (
            <div className="relative">
              <button onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 rounded-xl pl-1 pr-2 py-1 transition" aria-expanded={openMenu === 'profile'}>
                <Avatar name={user.name} />
                <span className="text-sm font-bold hidden sm:block max-w-[90px] truncate">{user.name}</span>
                <Icon name="chevR" className={`w-4 h-4 transition-transform ${openMenu === 'profile' ? '-rotate-90' : 'rotate-90'}`} />
              </button>
              {openMenu === 'profile' && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-pop-in z-50">
                  <div className="px-4 py-3 bg-gradient-to-r from-blood-600 to-blood-700 text-white">
                    <p className="font-extrabold truncate">{user.name}</p>
                    <p className="text-xs text-white/80 truncate">{user.email || user.phone || ''}</p>
                  </div>
                  {menuItems.map(([h, ic, l]) => (
                    <Link key={h} href={h} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-red-50 hover:text-blood-700 transition">
                      <Icon name={ic} className="w-5 h-5 text-gray-400" />{l}
                    </Link>
                  ))}
                  <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 border-t hover:bg-red-50 transition">
                    <Icon name="logout" className="w-5 h-5" />লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (<><Link href="/login" className="text-sm font-bold px-3 py-2 hidden sm:block hover:text-blood-700">লগইন</Link><Link href="/register" className="btn-blood !py-2 !px-4 text-sm !w-auto">নিবন্ধন</Link></>)}
        </div>
      </div>
    </header>
  );
}
