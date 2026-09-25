import { headers } from 'next/headers';
import CampaignView from './CampaignView';

async function getCamp(id) {
  try {
    const h = headers();
    const proto = h.get('x-forwarded-proto') || 'https';
    const host = h.get('x-forwarded-host') || h.get('host');
    const base = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : '');
    if (!base) return null;
    const r = await fetch(`${base}/api/campaigns/${id}`, { next: { revalidate: 300 } });
    const j = await r.json();
    return j.ok ? j.data : null;
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const icon = site ? `${site}/icons/blood-trio.png` : '/icons/blood-trio.png';
  const fallback = { title: 'রক্তদান ক্যাম্পেইন — BloodLink' };
  const c = await getCamp(params.id);
  if (!c) return fallback;
  const title = `${c.title} | BloodLink`;
  const description = `${c.organizer_name || ''} — ${c.venue || ''}, ${c.event_date || ''}। স্বেচ্ছায় রক্তদানে এগিয়ে আসুন।`;
  return {
    title, description,
    openGraph: { title, description, type: 'article', siteName: 'BloodLink', locale: 'bn_BD', images: [{ url: icon, width: 512, height: 512 }] },
    twitter: { card: 'summary', title, description, images: [icon] }
  };
}

export default function Page({ params }) {
  return <CampaignView id={params.id} />;
}
