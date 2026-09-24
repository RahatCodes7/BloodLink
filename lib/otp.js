'use client';
// ডেমো OTP — আসল SMS প্রোভাইডার (SSL Wireless / BulkSMSBD) পরে এই মডিউলে বসবে।
// এখন: কোড localStorage-এ ৫ মিনিট থাকে, UI-তে ডেমো হিসেবে দেখানো হয়।
const K = 'bl_otp';

function read() { try { return JSON.parse(localStorage.getItem(K) || '{}'); } catch { return {}; } }

export function requestOtp(phone) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const all = read();
  all[phone] = { code, exp: Date.now() + 5 * 60 * 1000 };
  try { localStorage.setItem(K, JSON.stringify(all)); } catch {}
  return code; // production-এ এখানে SMS পাঠিয়ে code ফেরত দেবেন না
}

export function verifyOtp(phone, code) {
  const all = read();
  const rec = all[phone];
  if (!rec) return { ok: false, msg: 'কোড পাঠানো হয়নি। আবার পাঠান।' };
  if (Date.now() > rec.exp) return { ok: false, msg: 'কোডের মেয়াদ শেষ। নতুন কোড নিন।' };
  if (String(code).trim() !== rec.code) return { ok: false, msg: 'কোড ভুল হয়েছে।' };
  delete all[phone];
  try { localStorage.setItem(K, JSON.stringify(all)); } catch {}
  const v = readVerified(); v[phone] = Date.now();
  try { localStorage.setItem('bl_verified_phones', JSON.stringify(v)); } catch {}
  return { ok: true };
}

function readVerified() { try { return JSON.parse(localStorage.getItem('bl_verified_phones') || '{}'); } catch { return {}; } }
export function isPhoneVerified(phone) { return Boolean(phone && readVerified()[phone]); }
