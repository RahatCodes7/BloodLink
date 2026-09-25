// Service: Email OTP (Gmail SMTP, ফ্রি) — reset + verify।
// কোড hash করে রাখা, ১০ মিনিট মেয়াদ, ভুল ৫ বার + ১০ মিনিটে ৩ বার সীমা।
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { query } = require('../lib/db/client');

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

function mailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) { const e = new Error('Email সার্ভার কনফিগার হয়নি (GMAIL_USER / GMAIL_APP_PASSWORD)।'); e.status = 500; throw e; }
  // timeout: আটকে না থেকে দ্রুত error দেবে
  return nodemailer.createTransport({
    service: 'gmail', auth: { user, pass },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000
  });
}

function hash(code, email) {
  return crypto.createHash('sha256').update(`${email}:${code}`).digest('hex');
}

async function sendMail(to, subject, html) {
  // Brevo HTTP API (port 443 — cloud-এ block হয় না) থাকলে সেটাই:
  if (process.env.BREVO_API_KEY) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER || process.env.GMAIL_USER, name: 'BloodLink' },
        to: [{ email: to }], subject, htmlContent: html
      })
    });
    if (!r.ok) { const e = new Error('ইমেইল পাঠানো যায়নি।'); e.status = 502; throw e; }
    return;
  }
  const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
  await mailer().sendMail({ from: `"BloodLink" <${from}>`, to, subject, html });
}

const TPL = (code, purpose) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #eee;border-radius:16px;padding:24px">
    <h2 style="color:#b91c1c">🩸 BloodLink</h2>
    <p>${purpose === 'reset' ? 'পাসওয়ার্ড রিসেটের' : 'ইমেইল যাচাইয়ের'} জন্য আপনার কোড:</p>
    <p style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center">${code}</p>
    <p style="color:#666;font-size:13px">মেয়াদ ${CODE_TTL_MIN} মিনিট। কাউকে দেবেন না।</p>
  </div>`;

async function requestOtp(email, purpose) {
  const em = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { const e = new Error('সঠিক ইমেইল দিন।'); e.status = 400; throw e; }
  if (!['reset', 'verify'].includes(purpose)) { const e = new Error('purpose ভুল।'); e.status = 400; throw e; }
  if (purpose === 'reset') {
    const u = (await query('SELECT id FROM users WHERE lower(email)=lower($1) AND deleted_at IS NULL', [em])).rows[0];
    if (!u) { const e = new Error('এই ইমেইলে অ্যাকাউন্ট পাওয়া যায়নি।'); e.status = 404; throw e; }
  }
  const recent = (await query(
    `SELECT count(*)::int c FROM otp_codes WHERE email=$1 AND purpose=$2 AND created_at > now() - interval '10 minutes'`, [em, purpose])).rows[0].c;
  if (recent >= 3) { const e = new Error('অনেকবার পাঠানো হয়েছে। ১০ মিনিট পরে আবার দিন।'); e.status = 429; throw e; }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await query(`INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES ($1,$2,$3, now() + interval '${CODE_TTL_MIN} minutes')`,
    [em, hash(code, em), purpose]);
  await sendMail(em, purpose === 'reset' ? 'BloodLink — পাসওয়ার্ড রিসেট কোড' : 'BloodLink — ইমেইল যাচাই কোড', TPL(code, purpose));
  return { sent: true };
}

/** কোড যাচাই + consume (একবারই ব্যবহারযোগ্য)। */
async function consumeOtp(email, code, purpose) {
  const em = String(email || '').trim().toLowerCase();
  const row = (await query(
    `SELECT * FROM otp_codes WHERE email=$1 AND purpose=$2 AND consumed=FALSE AND expires_at > now() ORDER BY created_at DESC LIMIT 1`,
    [em, purpose])).rows[0];
  if (!row) { const e = new Error('কোড পাওয়া যায়নি বা মেয়াদ শেষ। নতুন কোড নিন।'); e.status = 400; throw e; }
  if (row.attempts >= MAX_ATTEMPTS) { const e = new Error('অনেকবার ভুল হয়েছে। নতুন কোড নিন।'); e.status = 429; throw e; }
  if (row.code_hash !== hash(String(code || '').trim(), em)) {
    await query('UPDATE otp_codes SET attempts=attempts+1 WHERE id=$1', [row.id]);
    const e = new Error('কোড ভুল হয়েছে।'); e.status = 400; throw e;
  }
  await query('UPDATE otp_codes SET consumed=TRUE WHERE id=$1', [row.id]);
  return { email: em };
}

module.exports = { requestOtp, consumeOtp };
