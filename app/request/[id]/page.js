import { headers } from 'next/headers';
import RequestView from './RequestView';

async function getReq(id) {
  try {
    const h = headers();
    const proto = h.get('x-forwarded-proto') || 'https';
    const host = h.get('x-forwarded-host') || h.get('host');
    const base = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : '');
    if (!base) return null;
    const r = await fetch(`${base}/api/blood-requests/${id}`, { next: { revalidate: 60 } });
    const j = await r.json();
    return j.ok ? j.data : null;
  } catch { return null; }
}

function urgBn(u) {
  return u === 'CRITICAL' ? 'অত্যন্ত জরুরি' : u === 'URGENT' ? 'জরুরি' : 'সাধারণ';
}

export async function generateMetadata({ params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const icon = site ? `${site}/icons/blood-hero.png` : '/icons/blood-hero.png';
  const fallback = { title: 'রক্তের অনুরোধ — BloodLink', description: 'BloodLink-এ জরুরি রক্তের অনুরোধ দেখুন।' };
  const r = await getReq(params.id);
  if (!r) return fallback;
  const loc = r.location_text || r.hospital_name || '';
  const title = `${r.blood_group} রক্ত প্রয়োজন${loc ? ` — ${loc}` : ''} | BloodLink`;
  const description = `${loc} — ${r.blood_group} রক্তের ${urgBn(r.urgency)} অনুরোধ (${r.bags_required} ব্যাগ)। আপনি বা পরিচিত কেউ দিতে পারলে এগিয়ে আসুন।`;
  return {
    title, description,
    openGraph: { title, description, type: 'article', siteName: 'BloodLink', locale: 'bn_BD', images: [{ url: icon, width: 512, height: 512, alt: 'BloodLink' }] },
    twitter: { card: 'summary', title, description, images: [icon] }
  };
}

export default function Page({ params }) {
  return <RequestView id={params.id} />;
}
