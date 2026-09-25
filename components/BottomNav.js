'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Icon from './icons';
const items = [
  { href: '/', icon: 'home', label: 'হোম' },
  { href: '/search', icon: 'search', label: 'খুঁজুন' },
  { href: '/request-new', icon: 'drop', label: 'রক্ত চাই', center: true },
  { href: '/dashboard/notifications', icon: 'bell', label: 'নোটিফাই' },
  { href: '/dashboard', icon: 'user', label: 'আমি' }
];
export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-t border-white/40 shadow-[0_-8px_30px_-10px_rgba(185,28,28,.25)] bottom-nav-safe" aria-label="মোবাইল মেনু">
      <div className="grid grid-cols-5">
        {items.map(it => {
          const active = path === it.href;
          return (
            <Link key={it.href + it.label} href={it.href}
              className={cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition', active ? 'text-blood-700' : 'text-gray-400')}>
              {it.center
                ? <span className="-mt-7 w-14 h-14 rounded-full bg-gradient-to-br from-blood-500 to-blood-800 text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(185,28,28,.6)] border-4 border-white/70 animate-pulse-ring active:scale-95 transition"><Icon name="drop" className="w-7 h-7" /></span>
                : <span className={cn('px-3 py-1 rounded-full transition flex flex-col items-center', active && 'bg-blood-600 text-white shadow-[0_4px_12px_-2px_rgba(185,28,28,.5)]')}><Icon name={it.icon} className="w-6 h-6" /></span>}
              <span className={cn(active && 'text-blood-700')}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
