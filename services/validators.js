// Shared validation — server-side, client validation-এর উপর কখনো ভরসা নয়।
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY = ['NORMAL', 'URGENT', 'CRITICAL'];
const STATUS = ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PARTIALLY_FULFILLED', 'FULFILLED', 'EXPIRED', 'CANCELLED', 'REJECTED'];

// বৈধ lifecycle transition (অবৈধ state jump প্রতিরোধ):
const TRANSITIONS = {
  DRAFT: ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['ACTIVE', 'REJECTED', 'CANCELLED'],
  ACTIVE: ['PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
  PARTIALLY_FULFILLED: ['FULFILLED', 'CANCELLED'],
  FULFILLED: [], EXPIRED: [], CANCELLED: [], REJECTED: []
};

function assertTransition(from, to) {
  if (!(TRANSITIONS[from] || []).includes(to)) {
    const e = new Error(`Invalid status transition: ${from} → ${to}`);
    e.status = 422; throw e;
  }
}

function isBDPhone(p) { return /^01[3-9]\d{8}$/.test(String(p || '').trim()); }

function validateRequestInput(d) {
  const errs = [];
  if (!BLOOD_GROUPS.includes(d.blood_group)) errs.push('blood_group invalid');
  if (!Number.isInteger(d.bags_required) || d.bags_required < 1 || d.bags_required > 10) errs.push('bags_required must be 1..10');
  if (!URGENCY.includes(d.urgency)) errs.push('urgency invalid');
  if (!d.required_date || isNaN(Date.parse(d.required_date))) errs.push('required_date invalid');
  if (!isBDPhone(d.contact_phone)) errs.push('contact_phone invalid');
  if (d.description && d.description.length > 500) errs.push('description too long');
  if (!d.division_id || !d.district_id) errs.push('division/district required');
  if (!d.upazila_id) errs.push('উপজেলা নির্বাচন করুন।');
  if (errs.length) { const e = new Error(errs.join('; ')); e.status = 400; throw e; }
}

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const MOD_ROLES = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
function requireRole(user, roles) {
  if (!user || !roles.includes(user.role)) { const e = new Error('Forbidden'); e.status = 403; throw e; }
}

module.exports = { BLOOD_GROUPS, URGENCY, STATUS, TRANSITIONS, assertTransition, isBDPhone, validateRequestInput, requireRole, ADMIN_ROLES, MOD_ROLES };
