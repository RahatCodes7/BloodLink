'use client';
// ডেমো/লোকাল স্টোর — Supabase কনফিগার না থাকলে localStorage ব্যবহার করে।
// Supabase থাকলে একই ফাংশনগুলো Supabase কোয়েরিতে প্রতিস্থাপন করুন (দেখুন supabase/schema.sql)।
const K = { user: 'bl_user', requests: 'bl_requests', donors: 'bl_donors', saved: 'bl_saved', notif: 'bl_notif', reports: 'bl_reports', msgs: 'bl_msgs', campaigns: 'bl_campaigns' };

function read(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);

export const seedRequests = [
  { id: '8F92K', blood_group: 'O+', bags_required: 2, bags_fulfilled: 0, urgency: 'urgent', division_id: 'khulna', district_id: 'khulna', upazila_id: '', hospital: 'খুলনা মেডিকেল কলেজ হাসপাতাল', location_text: 'খুলনা মেডিকেল কলেজ হাসপাতাল', required_date: new Date().toISOString().slice(0, 10), required_time: 'সকাল ১০টা', description: 'ডেলিভারি রোগীর জন্য জরুরি ভিত্তিতে ২ ব্যাগ O+ রক্ত প্রয়োজন।', contact_phone: '01700000001', whatsapp_enabled: true, status: 'ACTIVE', verified_requester: true, created_at: new Date().toISOString() },
  { id: '7A11Q', blood_group: 'B+', bags_required: 1, bags_fulfilled: 0, urgency: 'critical', division_id: 'dhaka', district_id: 'dhaka', upazila_id: 'dhaka-savar', hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', location_text: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', required_date: new Date().toISOString().slice(0, 10), required_time: 'আজ সন্ধ্যা', description: 'সড়ক দুর্ঘটনায় আহত রোগীর জন্য অত্যন্ত জরুরি রক্ত প্রয়োজন।', contact_phone: '01700000002', whatsapp_enabled: true, status: 'ACTIVE', verified_requester: true, created_at: new Date().toISOString() },
  { id: '5C77M', blood_group: 'A-', bags_required: 3, bags_fulfilled: 1, urgency: 'normal', division_id: 'chattogram', district_id: 'chattogram', upazila_id: '', hospital: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', location_text: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', required_date: new Date().toISOString().slice(0, 10), required_time: 'আগামীকাল', description: 'অপারেশনের জন্য A- রক্ত প্রয়োজন।', contact_phone: '01700000003', whatsapp_enabled: false, status: 'ACTIVE', verified_requester: false, created_at: new Date().toISOString() }
];
export const seedDonors = [
  { id: 'd1', name: 'রহমান', blood_group: 'O+', division_id: 'khulna', district_id: 'khulna-d', available: true, donations: 4, phone: '01700000011' },
  { id: 'd2', name: 'ফাতেমা খাতুন', blood_group: 'B+', division_id: 'dhaka', district_id: 'dhaka', available: true, donations: 2, phone: '01700000012' },
  { id: 'd3', name: 'সাকিব হাসান', blood_group: 'A-', division_id: 'chattogram', district_id: 'chattogram', available: false, donations: 6, phone: '01700000013' }
];

export function seedCampaigns() {
  const plus = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
  return [
    { id: 'c1', title: 'স্বেচ্ছায় রক্তদান কর্মসূচি', organizer_name: 'খুলনা ব্লাড ডোনার্স ক্লাব', description: 'সবার জন্য উন্মুক্ত স্বেচ্ছায় রক্তদান কর্মসূচি। সকাল ৯টা থেকে দুপুর ২টা।', division_id: 'khulna', district_id: 'khulna', upazila_id: '', venue: 'খুলনা প্রেসক্লাব মিলনায়তন', event_date: plus(6), start_time: 'সকাল ৯টা', end_time: 'দুপুর ২টা', contact_phone: '01700000021', status: 'UPCOMING', created_at: new Date().toISOString() },
    { id: 'c2', title: 'ক্যাম্পাস ব্লাড ড্রাইভ', organizer_name: 'ঢাকা কলেজ রোভার স্কাউট', description: 'শিক্ষার্থীদের জন্য রক্তদান কর্মসূচি ও সচেতনতা সভা।', division_id: 'dhaka', district_id: 'dhaka', upazila_id: '', venue: 'ঢাকা কলেজ অডিটোরিয়াম', event_date: plus(13), start_time: 'সকাল ১০টা', end_time: 'বিকাল ৪টা', contact_phone: '01700000022', status: 'UPCOMING', created_at: new Date().toISOString() }
  ];
}
export function ensureSeed() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(K.requests)) write(K.requests, seedRequests);
  if (!localStorage.getItem(K.donors)) write(K.donors, seedDonors);
  if (!localStorage.getItem(K.campaigns)) write(K.campaigns, seedCampaigns());
  if (!localStorage.getItem(K.saved)) write(K.saved, []);
  if (!localStorage.getItem(K.notif)) write(K.notif, [{ id: uid('n'), title: '🔔 স্বাগতম!', message: 'BloodLink-এ স্বাগতম। জরুরি অনুরোধ এখানে পাবেন।', is_read: false, created_at: new Date().toISOString(), ref: null }]);
  if (!localStorage.getItem(K.reports)) write(K.reports, []);
  if (!localStorage.getItem(K.msgs)) write(K.msgs, {});
}
export const store = {
  getUser: () => (typeof window === 'undefined' ? null : read(K.user, null)),
  setUser: (u) => write(K.user, u),
  logout: () => localStorage.removeItem(K.user),
  getRequests: () => (typeof window === 'undefined' ? [] : read(K.requests, seedRequests)),
  addRequest: (r) => { const all = read(K.requests, []); all.unshift(r); write(K.requests, all); return r; },
  updateRequest: (id, patch) => { const all = read(K.requests, []).map(x => x.id === id ? { ...x, ...patch } : x); write(K.requests, all); },
  getRequest: (id) => read(K.requests, []).find(x => String(x.id) === String(id)),
  getDonors: () => (typeof window === 'undefined' ? [] : read(K.donors, seedDonors)),
  addDonor: (d) => { const all = read(K.donors, []); all.unshift(d); write(K.donors, all); },
  getSaved: () => (typeof window === 'undefined' ? [] : read(K.saved, [])),
  toggleSave: (id) => { let s = read(K.saved, []); s = s.includes(id) ? s.filter(x => x !== id) : [...s, id]; write(K.saved, s); return s; },
  getNotif: () => (typeof window === 'undefined' ? [] : read(K.notif, [])),
  pushNotif: (n) => { const all = read(K.notif, []); all.unshift({ id: uid('n'), is_read: false, created_at: new Date().toISOString(), ...n }); write(K.notif, all); },
  markNotifRead: (id) => write(K.notif, read(K.notif, []).map(n => n.id === id ? { ...n, is_read: true } : n)),
  getReports: () => (typeof window === 'undefined' ? [] : read(K.reports, [])),
  addReport: (r) => { const all = read(K.reports, []); all.unshift({ id: uid('rep'), status: 'নতুন', created_at: new Date().toISOString(), ...r }); write(K.reports, all); },
  getMsgs: (cid) => (read(K.msgs, {})[cid] || []),
  sendMsg: (cid, m) => { const all = read(K.msgs, {}); all[cid] = [...(all[cid] || []), m]; write(K.msgs, all); },
  getCampaigns: () => (typeof window === 'undefined' ? [] : read(K.campaigns, [])),
  addCampaign: (c) => { const all = read(K.campaigns, []); all.unshift(c); write(K.campaigns, all); return c; },
};
