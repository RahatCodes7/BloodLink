// রক্তদান যোগ্যতা হিসাব — চিকিৎসাগত সিদ্ধান্ত নয়, শুধু সাধারণ নির্দেশিকা (৪ মাস বিরতি)।
// চূড়ান্ত সিদ্ধান্ত চিকিৎসকের।
export const DONATION_GAP_DAYS = 120;

export function nextEligibleDate(lastDate) {
  if (!lastDate) return null;
  const d = new Date(lastDate);
  d.setDate(d.getDate() + DONATION_GAP_DAYS);
  return d;
}

export function eligibility(lastDate, today = new Date()) {
  if (!lastDate) return { eligible: true, daysLeft: 0, nextDate: null, neverDonated: true };
  const next = nextEligibleDate(lastDate);
  const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { eligible: true, daysLeft: 0, nextDate: next, neverDonated: false };
  return { eligible: false, daysLeft: diff, nextDate: next, neverDonated: false };
}

export function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return String(d); }
}
