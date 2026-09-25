// Service: auth — নিজের JWT (CockroachDB users টেবিলে)।
// Supabase Auth বাদ দেওয়া হয়েছে: ফোন-কেন্দ্রিক ইউজার + single source of truth।
// Session: httpOnly cookie `bl_session` (7 দিন)। Secret: SESSION_SECRET (env)।
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepo = require('../lib/db/repositories/users');
const { isBDPhone } = require('./validators');

const COOKIE = 'bl_session';
const TTL = 60 * 60 * 24 * 7; // 7 দিন (সেকেন্ড)

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) { const e = new Error('SESSION_SECRET is not set'); e.status = 500; throw e; }
  return s;
}

async function hashPassword(pw) { return bcrypt.hash(pw, 12); }

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, secret(), { expiresIn: TTL });
}

function verifyToken(token) {
  try {
    const p = jwt.verify(token, secret());
    return { id: p.sub, role: p.role };
  } catch { return null; }
}

function cookieHeader(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${TTL}; SameSite=Lax${secure}`;
}
function clearCookieHeader() {
  return `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

async function registerUser({ name, email, phone, password }) {
  if (!name || name.trim().length < 3) { const e = new Error('সঠিক নাম লিখুন।'); e.status = 400; throw e; }
  if (!isBDPhone(phone)) { const e = new Error('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)।'); e.status = 400; throw e; }
  if (!password || password.length < 6) { const e = new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।'); e.status = 400; throw e; }
  const em = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { const e = new Error('সঠিক ইমেইল দিন।'); e.status = 400; throw e; }
  const hash = await hashPassword(password);
  try {
    const u = await usersRepo.createUser({ fullName: name.trim(), email: em, phone: phone.trim(), passwordHash: hash });
    return { user: { id: u.id, name: u.full_name, email: u.email, role: u.role }, token: signToken(u) };
  } catch (e) {
    if (e.code === '23505') { const err = new Error('এই ইমেইল/ফোনে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।'); err.status = 409; throw err; }
    throw e;
  }
}

async function loginUser({ email, password }) {
  const em = String(email || '').trim().toLowerCase();
  const row = await usersRepo.findAuthByEmail(em);
  if (!row || !row.password_hash) { const e = new Error('ইমেইল বা পাসওয়ার্ড ভুল।'); e.status = 401; throw e; }
  if (!row.is_active) { const e = new Error('অ্যাকাউন্ট স্থগিত আছে।'); e.status = 403; throw e; }
  const ok = await bcrypt.compare(String(password || ''), row.password_hash);
  if (!ok) { const e = new Error('ইমেইল বা পাসওয়ার্ড ভুল।'); e.status = 401; throw e; }
  await usersRepo.touchLogin(row.id).catch(() => {});
  const user = { id: row.id, name: row.full_name, email: row.email, role: row.role };
  return { user, token: signToken({ id: row.id, role: row.role }) };
}

/** Cookie/header থেকে session user (id+role)। DB lookup কলার প্রয়োজনে করবে। */
function sessionFromToken(token) { return token ? verifyToken(token) : null; }

/** Firebase ID-token যাচাই → verified ফোন (+880...) ফেরত। Web API key দিয়েই চলে। */
async function verifiedPhoneFromIdToken(idToken) {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) { const e = new Error('Firebase কনফিগার হয়নি।'); e.status = 500; throw e; }
  const r = await fetch(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken })
  });
  const j = await r.json().catch(() => ({}));
  const phone = j && j.users && j.users[0] && j.users[0].phoneNumber;
  if (!phone) { const e = new Error('OTP যাচাই হয়নি।'); e.status = 401; throw e; }
  return phone; // +8801XXXXXXXXX
}

function e164ToBD(phone) {
  const d = String(phone || '');
  if (d.startsWith('+880')) return '0' + d.slice(4);
  return d;
}

/** পাসওয়ার্ড রিসেট: email + Firebase-verified phone মিললে নতুন hash বসে। */
async function resetPasswordWithFirebase({ email, newPassword, idToken }) {
  const em = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { const e = new Error('সঠিক ইমেইল দিন।'); e.status = 400; throw e; }
  if (!newPassword || newPassword.length < 6) { const e = new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।'); e.status = 400; throw e; }
  if (!idToken) { const e = new Error('OTP যাচাই করুন।'); e.status = 401; throw e; }
  const verifiedPhone = e164ToBD(await verifiedPhoneFromIdToken(idToken));
  const { query } = require('../lib/db/client');
  const row = (await query('SELECT id, phone FROM users WHERE lower(email)=lower($1) AND deleted_at IS NULL', [em])).rows[0];
  if (!row || row.phone !== verifiedPhone) { const e = new Error('তথ্য মিলছে না। ইমেইল ও ফোন যাচাই করুন।'); e.status = 400; throw e; }
  const hash = await hashPassword(newPassword);
  await query('UPDATE users SET password_hash=$2, updated_at=now() WHERE id=$1', [row.id, hash]);
  return { id: row.id };
}

module.exports = { COOKIE, TTL, hashPassword, signToken, verifyToken, cookieHeader, clearCookieHeader, registerUser, loginUser, sessionFromToken, resetPasswordWithFirebase };
