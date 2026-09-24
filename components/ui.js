'use client';
import { cn } from '@/lib/utils';
import { Spinner, FlatIcon } from './icons';
export function Button({ variant = 'blood', className, loading = false, children, disabled, ...p }) {
  const base = variant === 'outline' ? 'btn-outline' : variant === 'ghost' ? 'rounded-xl px-4 py-2 hover:bg-gray-100 font-semibold' : 'btn-blood';
  return (
    <button disabled={disabled || loading} aria-busy={loading}
      className={cn(base, 'w-full sm:w-auto text-center inline-flex items-center justify-center gap-2', className)} {...p}>
      {loading && <Spinner className="w-5 h-5" />}{children}
    </button>
  );
}
export function Input({ label, ...p }) {
  return (<label className="block mb-3"><span className="label">{label}</span><input className="input" {...p} /></label>);
}
export function Textarea({ label, ...p }) {
  return (<label className="block mb-3"><span className="label">{label}</span><textarea className="input min-h-[96px]" {...p} /></label>);
}
export function Select({ label, children, ...p }) {
  return (<label className="block mb-3"><span className="label">{label}</span><select className="input" {...p}>{children}</select></label>);
}
export function Card({ className, children }) { return <div className={cn('card p-4 sm:p-5', className)}>{children}</div>; }
export function Badge({ tone = 'gray', children }) {
  const m = { green: 'bg-green-100 text-green-800', orange: 'bg-orange-100 text-orange-800', red: 'bg-red-100 text-red-800', gray: 'bg-gray-100 text-gray-700', blood: 'bg-blood-50 text-blood-700 border border-blood-100' };
  return <span className={cn('badge', m[tone])}>{children}</span>;
}
export function Avatar({ name }) {
  return <div className="w-10 h-10 rounded-full bg-blood-100 text-blood-700 flex items-center justify-center font-bold text-lg" aria-hidden>{String(name || 'ব').slice(0, 1)}</div>;
}
export function Skeleton({ className }) { return <div className={cn('shimmer rounded-xl h-24', className)} />; }
export function EmptyState({ title, hint, icon = 'blood-badge.png' }) {
  return (<div className="card p-8 text-center">
    <FlatIcon src={icon} alt="" className="w-20 h-20 mx-auto mb-3 animate-floaty-sm" />
    <p className="font-bold">{title}</p>{hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}</div>);
}
export function Toast({ msg }) {
  if (!msg) return null;
  const ok = String(msg).startsWith('✓');
  return <div role="status" className="animate-toast-in fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg max-w-[90vw] flex items-center gap-2"><span className={ok ? 'text-green-400' : ''}>{ok ? '✓' : '•'}</span>{msg}</div>;
}
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="text-2xl leading-none px-2" aria-label="বন্ধ করুন">×</button></div>
        {children}
      </div>
    </div>
  );
}
