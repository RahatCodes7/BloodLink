'use client';
// API-first data layer — DB থেকে আসল ডেটা, ব্যর্থ হলে local fallback।
// DB urgency UPPERCASE → UI lowercase-এ normalize; donor phone privacy-র জন্য আসে না।

async function get(path) {
  const r = await fetch(path);
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'error');
  return j;
}

export function normRequest(r) {
  return {
    ...r,
    urgency: String(r.urgency || 'urgent').toLowerCase(),
    hospital: r.hospital || r.hospital_name || r.location_text || '',
    verified_requester: r.verified_requester ?? Boolean(r.requester_id)
  };
}

export function normDonor(d) {
  return {
    id: d.id,
    name: d.full_name || 'রক্তদাতা',
    blood_group: d.blood_group,
    division_id: d.division_id,
    district_id: d.district_id,
    available: (d.availability_status || d.availability) === 'AVAILABLE' || d.available === true,
    donations: d.donation_count ?? d.donations ?? 0,
    phone: d.phone || null, // public API ফোন দেয় না (privacy)
    last_donation: d.last_donation_date || d.last_donation || null
  };
}

export function normCampaign(c) {
  return { ...c, organizer_name: c.organizer_name || c.organizer || '' };
}

export async function fetchFeed(limit = 6) {
  const j = await get(`/api/blood-requests?limit=${limit}`);
  return (j.data || []).map(normRequest);
}

export async function fetchRequests(q = {}) {
  const p = new URLSearchParams();
  if (q.bloodGroup) p.set('bloodGroup', q.bloodGroup);
  if (q.divisionId) p.set('divisionId', q.divisionId);
  if (q.districtId) p.set('districtId', q.districtId);
  if (q.upazilaId) p.set('upazilaId', q.upazilaId);
  if (q.limit) p.set('limit', q.limit);
  const j = await get('/api/blood-requests?' + p.toString());
  return (j.data || []).map(normRequest);
}

export async function fetchRequest(id) {
  const j = await get(`/api/blood-requests/${id}`);
  return normRequest(j.data);
}

export async function fetchDonors(q = {}) {
  const p = new URLSearchParams();
  if (q.bloodGroup) p.set('bloodGroup', q.bloodGroup);
  if (q.districtId) p.set('districtId', q.districtId);
  if (q.upazilaId) p.set('upazilaId', q.upazilaId);
  if (q.availableOnly === false) p.set('availableOnly', 'false');
  const j = await get('/api/donors?' + p.toString());
  return (j.data || []).map(normDonor);
}

export async function fetchCampaigns() {
  const j = await get('/api/campaigns?limit=20');
  return (j.data || []).map(normCampaign);
}

export async function fetchCampaign(id) {
  const j = await get(`/api/campaigns/${id}`);
  return normCampaign(j.data);
}

export async function fetchCounts() {
  const [rq, dn, cp] = await Promise.all([
    get('/api/blood-requests?limit=1').catch(() => null),
    get('/api/donors?limit=1').catch(() => null),
    get('/api/campaigns?limit=1').catch(() => null)
  ]);
  return { requests: rq !== null, donors: dn !== null, campaigns: cp !== null };
}
