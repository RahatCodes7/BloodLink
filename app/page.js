'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { fetchFeed, fetchCampaigns } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/constants';
import { DIVISIONS } from '@/lib/locations';
import BloodGroupSelector from '@/components/BloodGroupSelector';
import LocationSelector from '@/components/LocationSelector';
import RequestCard from '@/components/RequestCard';
import Reveal from '@/components/Reveal';
import Icon, { FlatIcon } from '@/components/icons';
import { Card, EmptyState, Skeleton } from '@/components/ui';

function useCountUp(target, start) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now(), dur = 1200;
    let raf;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);
  return v;
}

export default function Home() {
  const router = useRouter();
  const [bg, setBg] = useState('');
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' });
  const [feed, setFeed] = useState(null);
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try {
        const [feed, camps] = await Promise.all([fetchFeed(6), fetchCampaigns()]);
        if (live) { setFeed(feed.filter(r => r.status === 'ACTIVE')); setCamps(camps.slice(0, 2)); }
      } catch {
        if (live) { setFeed(store.getRequests().filter(r => r.status === 'ACTIVE').slice(0, 6)); setCamps(store.getCampaigns().slice(0, 2)); }
      }
    })();
    return () => { live = false; };
  }, []);

  function goSearch() {
    const p = new URLSearchParams();
    if (bg) p.set('bg', bg);
    if (loc.division) p.set('div', loc.division);
    if (loc.district) p.set('dis', loc.district);
    if (loc.upazila) p.set('upa', loc.upazila);
    router.push('/search?' + p.toString());
  }

  return (
    <div className="pt-4 space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blood-700 via-blood-600 to-blood-800 text-white p-6 sm:p-10 shadow-soft">
        <img src="/icons/blood-double.png" alt="" aria-hidden="true" draggable={false}
          className="absolute -right-4 -top-4 w-40 sm:w-56 opacity-90 animate-floaty drop-shadow-2xl pointer-events-none" />
        <img src="/icons/blood-circle.png" alt="" aria-hidden="true" draggable={false}
          className="absolute right-32 bottom-2 w-14 opacity-60 animate-floaty-sm pointer-events-none hidden sm:block" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> এখনই {feed ? feed.length : '…'}টি সক্রিয় অনুরোধ
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">রক্ত খুঁজুন।<br />জীবন বাঁচান।</h1>
          <p className="mt-3 max-w-md text-white/90">জরুরি সময়ে প্রয়োজনীয় রক্তদাতা খুঁজে পেতে আপনার এলাকার মানুষের সাথে সহজে যুক্ত হন।</p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <Link href="/search" className="bg-white text-blood-700 font-bold rounded-xl px-6 py-3 text-center inline-flex items-center justify-center gap-2 hover:bg-red-50 active:scale-[.98] transition shadow-lg">রক্ত খুঁজুন <Icon name="arrow" className="w-5 h-5" /></Link>
            <Link href="/become-donor" className="border-2 border-white/70 font-bold rounded-xl px-6 py-3 text-center inline-flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[.98] transition">রক্তদাতা হন</Link>
          </div>
          <StatsRow />
        </div>
      </section>

      {/* QUICK SEARCH */}
      <Reveal>
      <Card>
        <h2 className="font-extrabold text-lg mb-3">আপনার প্রয়োজনের রক্ত খুঁজুন</h2>
        <p className="label">রক্তের গ্রুপ</p>
        <BloodGroupSelector value={bg} onChange={setBg} />
        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
          <button onClick={() => setBg('')} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${!bg ? 'bg-gray-900 text-white' : 'bg-white'}`}>সবগুলো</button>
          {BLOOD_GROUPS.map(g => <button key={g} onClick={() => setBg(g)} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${bg === g ? 'bg-blood-600 text-white' : 'bg-white'}`}>{g}</button>)}
        </div>
        <LocationSelector {...loc} onChange={setLoc} />
        <button onClick={goSearch} className="btn-blood mt-2 inline-flex items-center justify-center gap-2">রক্ত খুঁজুন <Icon name="arrow" className="w-5 h-5" /></button>
      </Card>
      </Reveal>

      {/* EMERGENCY FEED */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-xl">জরুরি রক্তের অনুরোধ</h2>
          <Link href="/search" className="text-blood-700 font-bold text-sm">সব দেখুন →</Link>
        </div>
        {!feed ? (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} />)}</div>)
        : feed.length === 0 ? (<EmptyState title="এখন কোনো সক্রিয় রক্তের অনুরোধ পাওয়া যায়নি।" hint="অন্য এলাকা বা রক্তের গ্রুপ দিয়ে আবার চেষ্টা করুন।" />)
        : (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{feed.map(r => <RequestCard key={r.id} r={r} />)}</div>)}
      </section>

      {/* CAMPAIGNS PREVIEW */}
      {camps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-xl">আসন্ন ক্যাম্পেইন</h2>
            <Link href="/campaigns" className="text-blood-700 font-bold text-sm">সব দেখুন →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {camps.map(c => (
              <Reveal key={c.id}>
                <Card className="card-hover">
                  <div className="flex gap-3 items-center">
                    <FlatIcon src="blood-trio.png" alt="" className="w-12 h-12 shrink-0" />
                    <div>
                      <p className="font-bold leading-snug">{c.title}</p>
                      <p className="text-xs text-gray-500">📅 {c.event_date} • {c.venue}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="grid sm:grid-cols-3 gap-3">
        {[
          ['blood-trio.png', 'রক্ত খুঁজুন', 'গ্রুপ ও এলাকা দিয়ে সক্রিয় অনুরোধ খুঁজুন।'],
          ['donor-hands.png', 'রক্তদাতা হন', 'প্রোফাইল বানিয়ে প্রয়োজনে পাশে দাঁড়ান।'],
          ['blood-tube.png', 'যোগাযোগ করুন', 'কল বা WhatsApp-এ সরাসরি কথা বলুন।']
        ].map(([img, t, d], i) => (
          <Reveal key={t} delay={i * 100}>
            <Card className="card-hover text-center sm:text-left">
              <FlatIcon src={img} alt="" className="w-16 h-16 sm:mx-0 mx-auto" />
              <p className="font-bold mt-2">{t}</p><p className="text-sm text-gray-500">{d}</p>
            </Card>
          </Reveal>
        ))}
      </section>
      <p className="text-xs text-gray-400 text-center">BloodLink হাসপাতাল বা ব্লাড ব্যাংকের বিকল্প নয়।</p>
    </div>
  );
}

function StatsRow() {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 300); return () => clearTimeout(t); }, []);
  const a = useCountUp(1200, on), b = useCountUp(87, on), c = useCountUp(19, on);
  const items = [[a + '+', 'নিবন্ধিত রক্তদাতা'], [b, 'সক্রিয় অনুরোধ'], [c, 'আজ রক্তের ব্যবস্থা']];
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 max-w-md">
      {items.map(([v, l]) => (
        <div key={l} className="bg-white/10 rounded-xl px-2 py-2 text-center backdrop-blur-sm">
          <p className="text-xl font-extrabold tabular-nums">{v}</p>
          <p className="text-[11px] text-white/80 font-semibold">{l}</p>
        </div>
      ))}
    </div>
  );
}
