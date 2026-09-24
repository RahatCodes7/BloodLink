import { Card } from '@/components/ui';
export default function About() {
  return (
    <div className="pt-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-extrabold">আমাদের সম্পর্কে</h1>
      <Card><h2 className="font-bold mb-1">BloodLink কী?</h2>
        <p className="text-gray-600 text-[15px]">BloodLink এমন একটি কমিউনিটি প্ল্যাটফর্ম, যেখানে রক্তের প্রয়োজন থাকা মানুষ এবং সম্ভাব্য রক্তদাতারা একে অপরের সাথে যোগাযোগ করতে পারেন।</p>
        <p className="text-sm bg-red-50 border border-red-100 rounded-xl p-3 mt-3">BloodLink হাসপাতাল বা ব্লাড ব্যাংকের বিকল্প নয়। রক্তদানের আগে সংশ্লিষ্ট হাসপাতাল/ব্লাড ব্যাংক ও যোগ্য স্বাস্থ্যসেবা পেশাদারের নির্দেশনা অনুসরণ করুন।</p></Card>
      <Card><h2 className="font-bold mb-1">কীভাবে কাজ করে?</h2>
        <ol className="list-decimal ml-5 text-sm text-gray-600 space-y-1"><li>রক্তের অনুরোধ প্রকাশ করুন</li><li>ডোনাররা অনুরোধ খুঁজে পাবেন</li><li>কল/WhatsApp-এ যোগাযোগ করুন</li><li>রক্তের ব্যবস্থা হলে অনুরোধ বন্ধ করুন</li></ol></Card>
    </div>
  );
}
