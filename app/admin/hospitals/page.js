'use client';
import Shell from '../layout';
import { Card } from '@/components/ui';
import { HOSPITALS } from '@/lib/locations';
export default function AdminHospitals() {
  return <Shell title="হাসপাতাল ব্যবস্থাপনা">
    <button className="btn-blood !w-auto !py-2 text-sm mb-2">+ হাসপাতাল যোগ করুন</button>
    <div className="space-y-2">{HOSPITALS.map(h => <Card key={h.id}><p className="font-bold">🏥 {h.name_bn}</p><p className="text-xs text-gray-500">যাচাই: ✓ যাচাইকৃত</p>
      <div className="flex gap-1.5 mt-2">{['সম্পাদনা', 'যাচাই', 'নিষ্ক্রিয়'].map(a => <button key={a} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{a}</button>)}</div></Card>)}</div></Shell>;
}
