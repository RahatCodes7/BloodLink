'use client';
import { BLOOD_GROUPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
export default function BloodGroupSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="রক্তের গ্রুপ">
      {BLOOD_GROUPS.map(g => (
        <button key={g} type="button" role="radio" aria-checked={value === g}
          onClick={() => onChange(g)}
          className={cn('rounded-xl border-2 py-3 font-extrabold text-lg transition',
            value === g ? 'border-blood-600 bg-blood-600 text-white shadow-soft' : 'border-gray-200 bg-white hover:border-blood-300')}>{g}</button>
      ))}
    </div>
  );
}
