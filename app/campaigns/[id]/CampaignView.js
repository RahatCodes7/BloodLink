'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { fetchCampaign } from '@/lib/api';
import { divName, disName, upaName } from '@/lib/locations';
import { telLink, waLink } from '@/lib/utils';
import { Card, EmptyState } from '@/components/ui';
import { FlatIcon } from '@/components/icons';

export default function CampaignDetails({ id }) {
  const [c, setC] = useState(undefined);
  useEffect(() => {
    ensureSeed();
    let live = true;
    (async () => {
      try { const row = await fetchCampaign(id); if (live) setC(row); }
      catch { if (live) setC(store.getCampaigns().find(x => String(x.id) === String(id)) || null); }
    })();
    return () => { live = false; };
  }, [id]);
  if (c === null) return <div className="pt-6"><EmptyState title="ক্যাম্পেইন পাওয়া যায়নি।" icon="blood-trio.png" /></div>;
  if (!c) return <div className="pt-6">লোড হচ্ছে...</div>;
  return (
    <div className="pt-4 max-w-2xl mx-auto space-y-4">
      <Card>
        <div className="flex gap-3 items-start">
          <FlatIcon src="blood-trio.png" alt="" className="w-16 h-16 shrink-0 animate-floaty-sm" />
          <div>
            <h1 className="text-xl font-extrabold leading-snug">{c.title}</h1>
            <p className="text-sm text-gray-500">আয়োজনে: {c.organizer_name}</p>
          </div>
        </div>
        <dl className="mt-3 space-y-2 text-[15px]">
          {[['স্থান', `${c.venue}, ${disName(c.district_id)}`], ['বিভাগ', divName(c.division_id)], ['উপজেলা', upaName(c.upazila_id)],
            ['তারিখ', c.event_date], ['সময়', [c.start_time, c.end_time].filter(Boolean).join(' – ') || '—'],
            ['বিবরণ', c.description || '—']].map(([k, v]) => (
            <div key={k} className="flex gap-2 border-b border-gray-50 pb-1.5"><dt className="w-24 shrink-0 text-gray-500 font-semibold">{k}</dt><dd className="font-semibold">{v}</dd></div>))}
        </dl>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <a className="btn-blood text-center" href={telLink(c.contact_phone)}>📞 কল করুন</a>
        <a className="btn-blood text-center !bg-green-600" target="_blank" rel="noreferrer" href={waLink(c.contact_phone, `আসসালামু আলাইকুম, "${c.title}" ক্যাম্পেইন সম্পর্কে জানতে চাই।`)}>💬 WhatsApp</a>
      </div>
    </div>
  );
}
