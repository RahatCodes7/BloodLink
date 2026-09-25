import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t">
      <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6 text-sm">
        <div><p className="font-extrabold text-blood-700">🩸 BloodLink</p><p className="text-gray-500 mt-1">জীবনের প্রয়োজনে, রক্তের বন্ধনে</p>
        <p className="text-xs text-gray-400 mt-2">BloodLink হাসপাতাল বা ব্লাড ব্যাংকের বিকল্প নয়।</p></div>
        <nav className="flex flex-col gap-1.5 font-semibold" aria-label="ফুটার">
          <Link href="/about">আমাদের সম্পর্কে</Link><Link href="/campaigns">রক্তদান ক্যাম্পেইন</Link><Link href="/compatibility">সামঞ্জস্য চার্ট</Link><Link href="/faq">সাহায্য / FAQ</Link><Link href="/contact">যোগাযোগ</Link>
          <Link href="/privacy">প্রাইভেসি</Link><Link href="/terms">শর্তাবলি</Link>
        </nav>
        <div className="text-gray-500"><p className="font-bold text-gray-700 mb-1">জরুরি?</p><p>রক্ত খুঁজতে <Link className="text-blood-700 font-bold" href="/search">এখানে ক্লিক করুন</Link> অথবা নিকটস্থ হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।</p>
        <p className="text-[11px] text-gray-400 mt-3">Icons by <a className="underline" href="https://www.flaticon.com/" target="_blank" rel="noreferrer">Flaticon</a> (Freepik, wanicon, Vector Stall)</p></div>
      </div>
    </footer>
  );
}
