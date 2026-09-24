export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://bloodlink.example';
  return ['', '/search', '/donors', '/become-donor', '/about', '/faq', '/contact'].map(p => ({ url: base + p, lastModified: new Date() }));
}
