'use client';
import Shell from '../layout';
import { Card, Badge } from '@/components/ui';
const users = [
  { name: 'রহিম উদ্দিন', email: 'rahim@example.com', phone: '01711111111', bg: 'O+', loc: 'খুলনা', status: 'সক্রিয়', date: '২০২৬-০১-১২' },
  { name: 'ফাতেমা খাতুন', email: 'fatema@example.com', phone: '01722222222', bg: 'B+', loc: 'ঢাকা', status: 'সক্রিয়', date: '২০২৬-০৩-০২' },
  { name: 'সাকিব হাসান', email: 'sakib@example.com', phone: '01733333333', bg: 'A-', loc: 'চট্টগ্রাম', status: 'স্থগিত', date: '২০২৫-১১-২০' }
];
export default function AdminUsers() {
  return <Shell title="ব্যবহারকারী ব্যবস্থাপনা"><div className="space-y-2">{users.map(u => (
    <Card key={u.email}><div className="flex justify-between"><p className="font-bold">{u.name}</p><Badge tone={u.status === 'সক্রিয়' ? 'green' : 'orange'}>{u.status}</Badge></div>
      <p className="text-xs text-gray-500">{u.email} • {u.phone} • {u.bg} • {u.loc} • {u.date}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">{['প্রোফাইল দেখুন', 'যাচাই করুন', 'স্থগিত করুন', 'নিষিদ্ধ করুন', 'পুনরায় সক্রিয় করুন'].map(a => <button key={a} className="text-xs font-bold bg-gray-100 rounded-lg px-3 py-1.5">{a}</button>)}</div></Card>))}</div></Shell>;
}
