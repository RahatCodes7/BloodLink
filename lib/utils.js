export function cn(...a) { return a.filter(Boolean).join(' '); }
export function telLink(phone) { return `tel:${String(phone || '').replace(/[^+0-9]/g, '')}`; }
export function waLink(phone, text) {
  const p = String(phone || '').replace(/[^0-9]/g, '');
  return `https://wa.me/${p}?text=${encodeURIComponent(text || '')}`;
}
export function shareMessage(r) {
  return `🚨 জরুরি রক্ত প্রয়োজন\n\nরক্তের গ্রুপ: ${r.blood_group}\nপ্রয়োজন: ${r.bags_required} ব্যাগ\nস্থান: ${r.hospital || r.location_text || ''}\n\nআপনি বা আপনার পরিচিত কেউ রক্ত দিতে পারলে যোগাযোগ করুন।\n${typeof window !== 'undefined' ? window.location.origin : ''}/request/${r.id}`;
}
export function timeAgo(iso) {
  try {
    const d = new Date(iso), now = new Date();
    const m = Math.floor((now - d) / 60000);
    if (m < 1) return 'এইমাত্র';
    if (m < 60) return `${m} মিনিট আগে`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ঘণ্টা আগে`;
    return `${Math.floor(h / 24)} দিন আগে`;
  } catch { return ''; }
}
export function isValidBDPhone(p) { return /^01[3-9]\d{8}$/.test(String(p || '').trim()); }
