'use client';
import { useState } from 'react';
import { BLOOD_GROUPS } from '@/lib/constants';
import { CAN_DONATE_TO, CAN_RECEIVE_FROM, GROUP_FACT } from '@/lib/compatibility';
import BloodGroupSelector from '@/components/BloodGroupSelector';
import { Card, Badge } from '@/components/ui';
import { FlatIcon } from '@/components/icons';
import Reveal from '@/components/Reveal';

export default function Compatibility() {
  const [bg, setBg] = useState('O+');
  const give = CAN_DONATE_TO[bg];
  const take = CAN_RECEIVE_FROM[bg];

  return (
    <div className="pt-4 max-w-2xl mx-auto space-y-4">
      <div className="text-center">
        <FlatIcon src="blood-tube.png" alt="" className="w-16 h-16 mx-auto animate-floaty-sm" />
        <h1 className="text-2xl font-extrabold mt-1">রক্ত সামঞ্জস্য চার্ট</h1>
        <p className="text-sm text-gray-500">কে কাকে রক্ত দিতে পারে — শিক্ষামূলক ধারণা</p>
      </div>

      <Card>
        <p className="label">আপনার রক্তের গ্রুপ বেছে নিন</p>
        <BloodGroupSelector value={bg} onChange={setBg} />
        <p className="text-xs text-gray-500 mt-2 text-center">{GROUP_FACT[bg]}</p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Reveal>
          <Card className="border-t-4 !border-t-green-500">
            <p className="font-bold text-green-700">✓ {bg} দিতে পারবে</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {give.map(g => <Badge key={g} tone="green">{g}</Badge>)}
            </div>
            <p className="text-xs text-gray-400 mt-2">{give.length}টি গ্রুপ</p>
          </Card>
        </Reveal>
        <Reveal delay={100}>
          <Card className="border-t-4 !border-t-blood-500">
            <p className="font-bold text-blood-700">♥ {bg} নিতে পারবে</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {take.map(g => <Badge key={g} tone="blood">{g}</Badge>)}
            </div>
            <p className="text-xs text-gray-400 mt-2">{take.length}টি গ্রুপ থেকে</p>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card>
          <p className="font-bold mb-2">সম্পূর্ণ চার্ট (দাতা → গ্রহীতা)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm">
              <thead>
                <tr><th className="p-1.5 text-xs text-gray-400">দাতা ↓ গ্রহীতা →</th>
                  {BLOOD_GROUPS.map(g => <th key={g} className="p-1.5 font-extrabold text-blood-700">{g}</th>)}
                </tr>
              </thead>
              <tbody>
                {BLOOD_GROUPS.map(d => (
                  <tr key={d} className="border-t border-gray-50">
                    <td className="p-1.5 font-extrabold">{d}</td>
                    {BLOOD_GROUPS.map(r => (
                      <td key={r} className="p-1.5">
                        <span className={`inline-block w-6 h-6 leading-6 rounded-full text-xs font-bold ${CAN_DONATE_TO[d].includes(r) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-300'}`}>
                          {CAN_DONATE_TO[d].includes(r) ? '✓' : '–'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 space-y-1.5">
        <p className="font-extrabold">⚠️ গুরুত্বপূর্ণ সতর্কতা</p>
        <ul className="list-disc ml-5 space-y-1 text-[13px]">
          <li>এটি <b>শিক্ষামূলক সাধারণ ধারণা</b> (লোহিত রক্তকণিকার জন্য); প্লাজমার নিয়ম ভিন্ন।</li>
          <li>বাস্তবে রক্ত দেওয়ার আগে <b>ক্রস-ম্যাচ টেস্ট বাধ্যতামূলক</b> — চার্ট মিললেও টেস্ট ছাড়া নয়।</li>
          <li>চূড়ান্ত সিদ্ধান্ত সবসময় <b>চিকিৎসক ও ব্লাড ব্যাংকের</b>।</li>
          <li>BloodLink কোনো চিকিৎসাগত সামঞ্জস্যতার নিশ্চয়তা দেয় না।</li>
        </ul>
      </div>
    </div>
  );
}
