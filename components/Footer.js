import Link from 'next/link';

const cols = [
  ['প্ল্যাটফর্ম', [['রক্ত খুঁজুন', '/search'], ['রক্তদাতা', '/donors'], ['রক্তের অনুরোধ', '/request-new'], ['সকল আবেদন', '/requests'], ['ক্যাম্পেইন', '/campaigns'], ['সামঞ্জস্য চার্ট', '/compatibility']]],
  ['জানুন', [['আমাদের সম্পর্কে', '/about'], ['সাহায্য / FAQ', '/faq'], ['যোগাযোগ', '/contact']]],
  ['নিয়ম', [['শর্তাবলি', '/terms'], ['প্রাইভেসি নীতি', '/privacy']]]
];

export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-extrabold text-blood-700 text-lg">🩸 BloodLink</p>
          <p className="text-gray-500 text-sm mt-0.5">জীবনের প্রয়োজনে, রক্তের বন্ধনে</p>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">BloodLink একটি কমিউনিটি সংযোগ প্ল্যাটফর্ম — হাসপাতাল বা ব্লাড ব্যাংকের বিকল্প নয়। রক্তদানের আগে চিকিৎসকের নির্দেশনা নিন।</p>
        </div>
        {cols.map(([t, links]) => (
          <nav key={t} aria-label={t}>
            <p className="font-extrabold text-sm mb-2">{t}</p>
            <ul className="space-y-1.5 text-sm font-semibold text-gray-600">
              {links.map(([l, h]) => <li key={h + l}><Link href={h} className="hover:text-blood-700 transition">{l}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-gray-400">
          <p>© {new Date().getFullYear().toLocaleString('bn-BD', { useGrouping: false })} BloodLink • সর্বস্বত্ব সংরক্ষিত • 🇧🇩 ভালোবাসায় তৈরি</p>
          <p>Icons: <a className="underline" href="https://www.flaticon.com/" target="_blank" rel="noreferrer">Flaticon</a> + <a className="underline" href="https://openmoji.org/" target="_blank" rel="noreferrer">OpenMoji</a></p>
        </div>
      </div>
    </footer>
  );
}
