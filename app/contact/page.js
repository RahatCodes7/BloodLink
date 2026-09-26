'use client';
import Link from 'next/link';
import { Card } from '@/components/ui';
export default function Contact() {
  return (
    <div className="pt-4 max-w-xl mx-auto">
      <Card><h1 className="text-2xl font-extrabold">যোগাযোগ</h1>
        <p className="text-sm text-gray-500 mt-1 mb-3">সাধারণ প্রশ্নের উত্তর <Link href="/faq" className="text-blood-700 font-bold">FAQ-তে</Link> পাবেন। জরুরি রক্তের প্রয়োজনে সরাসরি <Link href="/search" className="text-blood-700 font-bold">রক্ত খুঁজুন</Link>।</p>
        <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-xl p-3">📢 যোগাযোগ ফর্ম শীঘ্রই আসছে। ততদিন FAQ দেখুন।</p>
      </Card>
    </div>
  );
}
