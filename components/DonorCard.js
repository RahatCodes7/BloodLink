'use client';
import { Card, Badge, Avatar } from './ui';
import { disName } from '@/lib/locations';
import { telLink } from '@/lib/utils';
import Icon from './icons';
export default function DonorCard({ d }) {
  return (
    <Card className="card-hover">
      <div className="flex items-center gap-3">
        <Avatar name={d.name} />
        <div className="flex-1">
          <p className="font-bold">{d.name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1"><Icon name="pin" className="w-3.5 h-3.5" />{disName(d.district_id)}</p>
        </div>
        <span className="text-xl font-extrabold text-blood-700">{d.blood_group}</span>
      </div>
      <div className="mt-2"><Badge tone={d.available ? 'green' : 'gray'}>{d.available ? '🟢 বর্তমানে উপলভ্য' : '⚪ বর্তমানে উপলভ্য নই'}</Badge></div>
      <p className="text-sm text-gray-600 mt-1">রক্তদান: {d.donations || 0} বার</p>
      <a className="btn-blood w-full text-center mt-3 !py-2.5 inline-flex items-center justify-center gap-2" href={telLink(d.phone)}><Icon name="phone" className="w-4 h-4" />যোগাযোগ করুন</a>
    </Card>
  );
}
