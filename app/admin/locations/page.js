'use client';
import Shell from '../layout';
import { Card } from '@/components/ui';
import { DIVISIONS, DISTRICTS, UPAZILAS } from '@/lib/locations';
export default function AdminLocations() {
  return <Shell title="লোকেশন ব্যবস্থাপনা">
    <div className="grid sm:grid-cols-3 gap-2">
      <Card><p className="font-bold mb-1">বিভাগ ({DIVISIONS.length})</p>{DIVISIONS.map(d => <p key={d.id} className="text-sm border-b py-1">{d.name_bn}</p>)}<button className="text-xs font-bold text-blood-700 mt-2">+ বিভাগ যোগ</button></Card>
      <Card><p className="font-bold mb-1">জেলা ({DISTRICTS.length})</p>{DISTRICTS.slice(0, 30).map(d => <p key={d.id} className="text-sm border-b py-1">{d.name_bn}</p>)}<p className="text-xs text-gray-400 mt-1">+ আরও {DISTRICTS.length - 30}টি</p><button className="text-xs font-bold text-blood-700 mt-2">+ জেলা যোগ</button></Card>
      <Card><p className="font-bold mb-1">উপজেলা ({UPAZILAS.length})</p>{UPAZILAS.slice(0, 30).map(d => <p key={d.id} className="text-sm border-b py-1">{d.name_bn}</p>)}<p className="text-xs text-gray-400 mt-1">+ আরও {UPAZILAS.length - 30}টি</p><button className="text-xs font-bold text-blood-700 mt-2">+ উপজেলা যোগ</button></Card>
    </div></Shell>;
}
