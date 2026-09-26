'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { FlatIcon } from '@/components/icons';
import Reveal from '@/components/Reveal';
import Icon from '@/components/icons';

const MISSION = [
  ['blood-trio.png', 'দ্রুত সংযোগ', 'জরুরি মুহূর্তে রোগী ও ডোনারের মধ্যে সেতু — একই উপজেলায় নোটিফিকেশন।'],
  ['donor-hands.png', 'বিশ্বাস', 'যাচাই প্রক্রিয়া, রিপোর্ট ব্যবস্থা ও প্রাইভেসি-প্রথম ডিজাইন।'],
  ['blood-badge.png', 'সম্প্রদায়', 'স্বেচ্ছাসেবী, সংগঠন ও হাসপাতাল — সবাই এক প্ল্যাটফর্মে।']
];

const STEPS = [
  ['১', 'অনুরোধ করুন', 'গ্রুপ, এলাকা ও হাসপাতাল দিয়ে ৮ ধাপে ফর্ম পূরণ করুন।'],
  ['২', 'ডোনার পায় খবর', 'একই উপজেলার মিলে যাওয়া ডোনারদের ফোনে নোটিফিকেশন যায়।'],
  ['৩', 'যোগাযোগ করুন', 'কল বা WhatsApp-এ সরাসরি কথা বলুন।'],
  ['৪', 'ব্যবস্থা হলে জানান', '"রক্ত পাওয়া গেছে" চাপুন — তালিকা থেকে সরে যাবে।']
];

export default function About() {
  const [stats, setStats] = useState({ donors: 0, requests: 0 });
  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/blood-requests?limit=50').then(r => r.json()).catch(() => null),
          fetch('/api/donors?limit=50').then(r => r.json()).catch(() => null)
        ]);
        setStats({
          requests: (r1 && r1.ok ? r1.data.length : 0),
          donors: (r2 && r2.ok ? r2.data.length : 0)
        });
      } catch {}
    })();
  }, []);

  return (
    <div className="pt-4 space-y-6 max-w-3xl mx-auto">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blood-700 via-blood-600 to-blood-800 text-white p-6 sm:p-10">
        <img src="/icons/donor-hands.png" alt="" aria-hidden="true" draggable={false} className="absolute -right-4 -bottom-4 w-40 sm:w-52 opacity-90 animate-floaty pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-bold bg-white/15 inline-block px-3 py-1.5 rounded-full mb-3">🩸 BloodLink সম্পর্কে</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">রক্তের প্রয়োজনে,<br />মানুষ মানুষের পাশে।</h1>
          <p className="mt-3 max-w-md text-white/90 text-[15px]">BloodLink এমন একটি কমিউনিটি প্ল্যাটফর্ম, যেখানে রক্তের প্রয়োজন থাকা মানুষ এবং সম্ভাব্য রক্তদাতারা একে অপরের সাথে যোগাযোগ করতে পারেন — দ্রুত, বিনামূল্যে, বাংলায়।</p>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-extrabold tabular-nums">{stats.donors}</p><p className="text-[11px] text-white/80">রক্তদাতা</p></div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center backdrop-blur-sm"><p className="text-xl font-extrabold tabular-nums">{stats.requests}</p><p className="text-[11px] text-white/80">মোট অনুরোধ</p></div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section>
        <h2 className="font-extrabold text-xl mb-3">আমাদের লক্ষ্য</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {MISSION.map(([img, t, d], i) => (
            <Reveal key={t} delay={i * 90}>
              <Card className="card-hover text-center h-full">
                <FlatIcon src={img} alt="" className="w-16 h-16 mx-auto" />
                <p className="font-bold mt-2">{t}</p>
                <p className="text-sm text-gray-500 mt-1">{d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section>
        <h2 className="font-extrabold text-xl mb-3">কীভাবে কাজ করে</h2>
        <div className="space-y-2.5">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={t} delay={i * 70}>
              <Card className="flex gap-3 items-start">
                <span className="w-9 h-9 shrink-0 rounded-full bg-blood-600 text-white font-extrabold flex items-center justify-center">{n}</span>
                <div><p className="font-bold">{t}</p><p className="text-sm text-gray-500">{d}</p></div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SAFETY */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
        <p className="font-extrabold mb-1">⚕️ মনে রাখুন</p>
        <p className="text-[13px]">BloodLink হাসপাতাল বা ব্লাড ব্যাংকের বিকল্প নয়। রক্তদানের আগে সংশ্লিষ্ট হাসপাতাল/ব্লাড ব্যাংক ও যোগ্য স্বাস্থ্যসেবা পেশাদারের নির্দেশনা অনুসরণ করুন। অপরিচিত নম্বরে অগ্রিম টাকা দেবেন না।</p>
      </div>

      {/* CTA */}
      <div className="grid sm:grid-cols-2 gap-2">
        <Link href="/search" className="btn-blood text-center inline-flex items-center justify-center gap-2">রক্ত খুঁজুন <Icon name="arrow" className="w-5 h-5" /></Link>
        <Link href="/become-donor" className="btn-outline text-center">রক্তদাতা হন</Link>
      </div>
    </div>
  );
}
