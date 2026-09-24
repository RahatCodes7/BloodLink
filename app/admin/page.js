'use client';
import { useEffect, useState } from 'react';
import { store, ensureSeed } from '@/lib/store';
import { BLOOD_GROUPS, STATUS_LABEL } from '@/lib/constants';
import { disName } from '@/lib/locations';
import Shell, { AdminStats } from './layout';
import { Card } from '@/components/ui';
import { BarChart, Donut, MiniBars } from '@/components/Charts';
import Reveal from '@/components/Reveal';

export default function AdminHome() {
  const [d, setD] = useState(null);
  useEffect(() => {
    ensureSeed();
    const reqs = store.getRequests();
    const donors = store.getDonors();
    const byBg = BLOOD_GROUPS.map(g => ({ label: g, value: reqs.filter(r => r.blood_group === g).length }));
    const byStatus = Object.keys(STATUS_LABEL).map(s => ({ label: STATUS_LABEL[s], value: reqs.filter(r => r.status === s).length })).filter(x => x.value > 0);
    const days = [...Array(7)].map((_, i) => {
      const t = new Date(); t.setDate(t.getDate() - (6 - i));
      const key = t.toISOString().slice(0, 10);
      return { label: t.toLocaleDateString('bn-BD', { weekday: 'short' }), value: reqs.filter(r => (r.created_at || '').slice(0, 10) === key).length };
    });
    const distMap = {};
    reqs.forEach(r => { const n = disName(r.district_id); distMap[n] = (distMap[n] || 0) + 1; });
    const byDist = Object.entries(distMap).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    const donorBg = BLOOD_GROUPS.map(g => ({ label: g, value: donors.filter(x => x.blood_group === g).length }));
    setD({ byBg, byStatus, days, byDist, donorBg });
  }, []);
  return (
    <Shell title="অ্যাডমিন ড্যাশবোর্ড">
      <AdminStats />
      {!d ? <p className="text-sm text-gray-400 mt-3">চার্ট লোড হচ্ছে...</p> : (
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <Reveal><Card><p className="font-bold mb-2">রক্তের গ্রুপ অনুযায়ী চাহিদা</p><BarChart data={d.byBg} /></Card></Reveal>
          <Reveal delay={80}><Card><p className="font-bold mb-2">স্ট্যাটাস বণ্টন</p><Donut data={d.byStatus} /></Card></Reveal>
          <Reveal><Card><p className="font-bold mb-2">গত ৭ দিনের অনুরোধ</p><MiniBars data={d.days} /></Card></Reveal>
          <Reveal delay={80}><Card><p className="font-bold mb-2">সক্রিয় জেলা (শীর্ষ ৫)</p><BarChart data={d.byDist} color="bg-green-600" /></Card></Reveal>
          <Reveal><Card className="sm:col-span-2"><p className="font-bold mb-2">ডোনার — গ্রুপ অনুযায়ী</p><BarChart data={d.donorBg} color="bg-red-400" /></Card></Reveal>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">⚠️ অ্যাডমিন অ্যাক্সেস Supabase RLS দিয়ে সুরক্ষিত করুন — শুধু ফ্রন্টএন্ড হাইড যথেষ্ট নয়।</p>
    </Shell>
  );
}
