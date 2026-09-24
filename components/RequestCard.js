'use client';
import Link from 'next/link';
import { URGENCY_LABEL } from '@/lib/constants';
import { Card, Badge } from './ui';
import Icon from './icons';
export function urgencyTone(u) { return u === 'critical' ? 'red' : u === 'urgent' ? 'orange' : 'green'; }
export default function RequestCard({ r }) {
  return (
    <Card className="card-hover">
      <div className="flex items-start justify-between gap-2">
        <Badge tone={urgencyTone(r.urgency)}>{URGENCY_LABEL[r.urgency] || r.urgency}</Badge>
        <span className="text-2xl font-extrabold text-blood-700">{r.blood_group}</span>
      </div>
      <h3 className="font-bold mt-2">{r.blood_group} রক্ত প্রয়োজন • {r.bags_required} ব্যাগ</h3>
      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5"><Icon name="pin" className="w-4 h-4 text-blood-500 shrink-0" />{r.hospital || r.location_text}</p>
      <p className="text-sm text-gray-600 flex items-center gap-1.5"><Icon name="calendar" className="w-4 h-4 text-blood-500 shrink-0" />{r.required_date}{r.required_time ? ` • ${r.required_time}` : ''}</p>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Icon name="shield" className="w-3.5 h-3.5 text-green-600" />{r.verified_requester ? 'যাচাইকৃত ব্যবহারকারী' : 'ব্যবহারকারী'}</p>
      <Link href={`/request/${r.id}`} className="btn-outline w-full block text-center mt-3 !py-2.5">বিস্তারিত দেখুন</Link>
    </Card>
  );
}
