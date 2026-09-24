'use client';
import Shell from '../layout';
import { Card } from '@/components/ui';
export default function Settings() {
  return <Shell title="সেটিংস"><Card><p className="font-bold mb-2">ভূমিকা ও অনুমতি</p>
    <ul className="text-sm text-gray-600 space-y-1"><li><b>USER</b> — নিজের প্রোফাইল ও অনুরোধ</li><li><b>DONOR</b> — ডোনার প্রোফাইল ও যোগাযোগ</li><li><b>MODERATOR</b> — রিপোর্ট ও অনুরোধ মডারেশন</li><li><b>ADMIN</b> — ব্যবহারকারী, অনুরোধ, লোকেশন, হাসপাতাল</li><li><b>SUPER_ADMIN</b> — সবকিছু + অ্যাডমিন ব্যবস্থাপনা</li></ul>
    <p className="text-xs text-gray-400 mt-2">⚠️ ভূমিকা কখনো ক্লায়েন্টে বিশ্বাস করবেন না — Supabase RLS + সার্ভার যাচাই বাধ্যতামূলক।</p></Card></Shell>;
}
