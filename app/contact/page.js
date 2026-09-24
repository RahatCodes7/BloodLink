'use client';
import { useState } from 'react';
import { Card, Input, Textarea, Button, Toast } from '@/components/ui';
export default function Contact() {
  const [t, setT] = useState('');
  const [sending, setSending] = useState(false);
  function send(e) {
    e.preventDefault(); setSending(true);
    setTimeout(() => { setSending(false); setT('✓ বার্তা পাঠানো হয়েছে। ধন্যবাদ!'); setTimeout(() => setT(''), 2000); e.target.reset(); }, 800);
  }
  return (
    <div className="pt-4 max-w-xl mx-auto">
      <Card><h1 className="text-2xl font-extrabold">যোগাযোগ</h1>
        <p className="text-sm text-gray-500 mb-3">মতামত বা সমস্যা জানান — আমরা দ্রুত উত্তর দেব।</p>
        <form onSubmit={send}>
          <Input label="নাম" required placeholder="আপনার নাম" /><Input label="ইমেইল" type="email" required placeholder="you@example.com" />
          <Textarea label="বার্তা" required placeholder="লিখুন..." /><Button loading={sending}>{sending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}</Button>
        </form></Card><Toast msg={t} />
    </div>
  );
}
