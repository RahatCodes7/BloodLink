'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// পেজ বদলের সময় উপরে পাতলা প্রগ্রেস বার — "প্রসেস হচ্ছে" ফিডব্যাক
export default function ProgressBar() {
  const path = usePathname();
  const [phase, setPhase] = useState('idle'); // idle | run | done

  useEffect(() => {
    setPhase('run');
    const t1 = setTimeout(() => setPhase('done'), 450);
    const t2 = setTimeout(() => setPhase('idle'), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [path]);

  if (phase === 'idle') return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent" aria-hidden="true">
      <div className={`h-full bg-gradient-to-r from-blood-500 via-blood-600 to-blood-500 rounded-r-full transition-all duration-500 ${phase === 'run' ? 'w-[70%] animate-progress-slide' : 'w-full opacity-0'}`} />
    </div>
  );
}
