'use client';
// API-first: আসল ডেটা CockroachDB থেকে (lib/api.js)। localStorage শুধু
// ব্যবহারকারীর নিজের ক্যাশ (saved/notif/session) + offline fallback।
// v2 key: পুরনো fake ডেমো ক্যাশ (v1) আর পড়া হয় না।
const K = { user: 'bl_user', requests: 'bl_requests_v2', donors: 'bl_donors_v2', saved: 'bl_saved', notif: 'bl_notif', reports: 'bl_reports', msgs: 'bl_msgs', campaigns: 'bl_campaigns_v2' };

function read(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);

export const seedRequests = [];
export const seedDonors = [];

export function seedCampaigns() { return []; }
export function ensureSeed() {
  if (typeof window === 'undefined') return;
  // পুরনো fake ক্যাশ থাকলে মুছে দিন (একবার):
  try { ['bl_requests', 'bl_donors', 'bl_campaigns'].forEach(k => localStorage.removeItem(k)); } catch {}
  if (!localStorage.getItem(K.requests)) write(K.requests, []);
  if (!localStorage.getItem(K.donors)) write(K.donors, []);
  if (!localStorage.getItem(K.campaigns)) write(K.campaigns, []);
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
