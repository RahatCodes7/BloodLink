'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store, ensureSeed } from '@/lib/store';
import { isValidBDPhone } from '@/lib/utils';
import LocationSelector from '@/components/LocationSelector';
import { Card, Input, Textarea, Button, Toast } from '@/components/ui';

export default function NewCampaign() {
  const router = useRouter();
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ title: '', organizer: '', division: '', district: '', upazila: '', venue: '', date: '', start: '', end: '', phone: '', desc: '' });
  useEffect(() => { ensureSeed(); if (!store.getUser()) router.push('/login'); }, [router]);
  function say(m) { setToast(m); setTimeout(() => setToast(''), 2200); }
  const set = k => e => setF({ ...f, [k]: e.target.value });
  function submit(e) {
    e.preventDefault();
    if (f.title.trim().length < 5) return say('শিরোনাম কমপক্ষে ৫ অক্ষরের দিন।');
    if (f.organizer.trim().length < 3) return say('আয়োজকের নাম দিন।');
    if (!f.date) return say('তারিখ দিন।');
    if (new Date(f.date) < new Date(new Date().toDateString())) return say('তারিখ আজ বা ভবিষ্যতের হতে হবে।');
    if (!isValidBDPhone(f.phone)) return say('সঠিক ফোন নম্বর দিন।');
    setLoading(true);
    setTimeout(() => {
      store.addCampaign({ id: 'c' + Date.now(), title: f.title.trim(), organizer_name: f.organizer.trim(), description: f.desc.slice(0, 1000),
        division_id: f.division, district_id: f.district, upazila_id: f.upazila, venue: f.venue.trim(),
        event_date: f.date, start_time: f.start, end_time: f.end, contact_phone: f.phone.trim(), status: 'UPCOMING', created_at: new Date().toISOString() });
      say('✓ ক্যাম্পেইন প্রকাশ হয়েছে!');
      setTimeout(() => router.push('/campaigns'), 800);
    }, 700);
  }
  return (
    <div className="pt-4 max-w-xl mx-auto">
      <Card>
        <h1 className="text-2xl font-extrabold mb-1">নতুন ক্যাম্পেইন</h1>
        <p className="text-sm text-gray-500 mb-4">রক্তদান কর্মসূচির তথ্য দিন</p>
        <form onSubmit={submit}>
          <Input label="শিরোনাম" required value={f.title} onChange={set('title')} placeholder="যেমন: স্বেচ্ছায় রক্তদান কর্মসূচি" />
          <Input label="আয়োজক" required value={f.organizer} onChange={set('organizer')} placeholder="সংগঠনের নাম" />
          <LocationSelector division={f.division} district={f.district} upazila={f.upazila} onChange={o => setF({ ...f, ...o })} />
          <Input label="স্থান" required value={f.venue} onChange={set('venue')} placeholder="ভেন্যুর নাম" />
          <div className="grid grid-cols-3 gap-2">
            <Input label="তারিখ" type="date" required value={f.date} onChange={set('date')} />
            <Input label="শুরু" value={f.start} onChange={set('start')} placeholder="সকাল ৯টা" />
            <Input label="শেষ" value={f.end} onChange={set('end')} placeholder="দুপুর ২টা" />
          </div>
          <Input label="ফোন" required value={f.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" inputMode="numeric" />
          <Textarea label="বিবরণ" value={f.desc} onChange={set('desc')} placeholder="সংক্ষেপে লিখুন..." />
          <Button loading={loading}>{loading ? 'প্রকাশ হচ্ছে...' : 'ক্যাম্পেইন প্রকাশ করুন'}</Button>
        </form>
      </Card>
      <Toast msg={toast} />
    </div>
  );
}
