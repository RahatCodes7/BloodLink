import { Card } from '@/components/ui';
export default function Privacy() {
  return <div className="pt-4 max-w-2xl mx-auto"><Card><h1 className="text-2xl font-extrabold mb-2">প্রাইভেসি নীতি</h1>
    <ul className="text-sm text-gray-600 space-y-2 list-disc ml-5"><li>আমরা নাম, ফোন, রক্তের গ্রুপ ও এলাকার তথ্য সংগ্রহ করি যোগাযোগের জন্য।</li><li>ফোন নম্বর প্রাইভেসি সেটিংস অনুযায়ী দেখানো হয়।</li><li>NID, বাসার ঠিকানা বা মেডিকেল ডকুমেন্ট প্রকাশ্যে চাওয়া হয় না।</li><li>আপনি যেকোনো সময় প্রোফাইল ও অনুরোধ মুছে ফেলতে পারেন।</li><li>তথ্য সুরক্ষায় Supabase Row Level Security ব্যবহার করা হয়।</li></ul></Card></div>;
}
export function generateMetadata() { return { title: 'প্রাইভেসি — BloodLink' }; }
