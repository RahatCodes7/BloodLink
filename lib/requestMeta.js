import { fmtDate } from '@/lib/eligibility';

export function createdBn(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' });
    const time = d.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
    return `${date}, ${time}`;
  } catch { return ''; }
}

/** মেয়াদ বাকি: "২ দিন বাকি" / "আজ শেষ" / "মেয়াদ শেষ" */
export function expiryBn(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt) - new Date();
  if (ms <= 0) return { text: 'মেয়াদ শেষ', soon: true, gone: true };
  const h = ms / 3600000;
  if (h < 24) return { text: 'আজই শেষ', soon: true, gone: false };
  return { text: `${Math.floor(h / 24).toLocaleString('bn-BD')} দিন বাকি`, soon: h < 48, gone: false };
}

export { fmtDate };
