// ডাটাবেস-চালিত লোকেশনের জন্য ফলব্যাক সিড ডেটা। প্রোডাকশনে Supabase divisions/districts/upazilas টেবিল ব্যবহার করুন।
export const DIVISIONS = [
  { id: 'dhaka', name: 'ঢাকা' }, { id: 'chattogram', name: 'চট্টগ্রাম' },
  { id: 'khulna', name: 'খুলনা' }, { id: 'rajshahi', name: 'রাজশাহী' },
  { id: 'barishal', name: 'বরিশাল' }, { id: 'sylhet', name: 'সিলেট' },
  { id: 'rangpur', name: 'রংপুর' }, { id: 'mymensingh', name: 'ময়মনসিংহ' }
];
export const DISTRICTS = [
  { id: 'dhaka-d', division_id: 'dhaka', name: 'ঢাকা' },
  { id: 'gazipur', division_id: 'dhaka', name: 'গাজীপুর' },
  { id: 'khulna-d', division_id: 'khulna', name: 'খুলনা' },
  { id: 'jashore', division_id: 'khulna', name: 'যশোর' },
  { id: 'chattogram-d', division_id: 'chattogram', name: 'চট্টগ্রাম' },
  { id: 'cumilla', division_id: 'chattogram', name: 'কুমিল্লা' },
  { id: 'rajshahi-d', division_id: 'rajshahi', name: 'রাজশাহী' },
  { id: 'sylhet-d', division_id: 'sylhet', name: 'সিলেট' }
];
export const UPAZILAS = [
  { id: 'khulna-sadar', district_id: 'khulna-d', name: 'খুলনা সদর' },
  { id: 'sonadanga', district_id: 'khulna-d', name: 'সোনাডাঙ্গা' },
  { id: 'mirpur', district_id: 'dhaka-d', name: 'মিরপুর' },
  { id: 'savar', district_id: 'dhaka-d', name: 'সাভার' },
  { id: 'kotwali-ctg', district_id: 'chattogram-d', name: 'কোতোয়ালী' }
];
export const HOSPITALS = [
  { id: 'kmch', name: 'খুলনা মেডিকেল কলেজ হাসপাতাল', district_id: 'khulna-d' },
  { id: 'dmch', name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', district_id: 'dhaka-d' },
  { id: 'cmch', name: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', district_id: 'chattogram-d' }
];
export function divName(id) { return (DIVISIONS.find(d => d.id === id) || {}).name || id || '—'; }
export function disName(id) { return (DISTRICTS.find(d => d.id === id) || {}).name || id || '—'; }
export function upaName(id) { return (UPAZILAS.find(d => d.id === id) || {}).name || id || '—'; }
export function hospName(id) { return (HOSPITALS.find(h => h.id === id) || {}).name || ''; }
