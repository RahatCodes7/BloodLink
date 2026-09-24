'use client';
// Firebase Phone Auth — apiKey public key, NEXT_PUBLIC_ দিয়ে রাখা safe।
// .env.local-এ বসান (দেখুন .env.example)। Config না থাকলে ডেমো OTP (lib/otp.js) চলে।
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function isFirebaseConfigured() {
  return Boolean(cfg.apiKey && cfg.projectId);
}

/** 01XXXXXXXXX → +8801XXXXXXXXX */
export function toE164BD(p) {
  const d = String(p || '').replace(/[^0-9]/g, '');
  if (d.startsWith('880')) return '+' + d;
  if (d.startsWith('01')) return '+880' + d.slice(1);
  return '+' + d;
}

let verifierPromise = null;

function auth() {
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  return getAuth(app);
}

/** verifier একবারই বানিয়ে রি-ইউজ — বারবার বানালে recaptcha "style of null" error দেয়। */
async function getVerifier() {
  if (!verifierPromise) {
    verifierPromise = (async () => {
      const el = document.getElementById('recaptcha-container');
      if (!el) throw Object.assign(new Error('recaptcha container missing'), { code: 'auth/missing-container' });
      const v = new RecaptchaVerifier(auth(), 'recaptcha-container', { size: 'invisible' });
      await v.render();
      return v;
    })().catch(e => { verifierPromise = null; throw e; });
  }
  return verifierPromise;
}

/** ব্যর্থ হলে verifier রিসেট — পরের চেষ্টায় নতুন করে বানাবে। */
export function resetVerifier() { verifierPromise = null; }

/** আসল SMS পাঠায়। Returns ConfirmationResult — পরে .confirm(code) ডাকুন। */
export async function sendFirebaseOtp(phoneE164) {
  const v = await getVerifier();
  return signInWithPhoneNumber(auth(), phoneE164, v);
}

export function firebaseErrorBn(code) {
  const m = {
    'auth/invalid-phone-number': 'ফোন নম্বর সঠিক নয় (+880 ফরম্যাটে যাবে)।',
    'auth/missing-phone-number': 'ফোন নম্বর পাওয়া যায়নি।',
    'auth/invalid-verification-code': 'কোড ভুল হয়েছে। আবার দেখে দিন।',
    'auth/code-expired': 'কোডের মেয়াদ শেষ। নতুন কোড নিন।',
    'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার দিন।',
    'auth/quota-exceeded': 'আজকের SMS সীমা শেষ। পরে চেষ্টা করুন।',
    'auth/operation-not-allowed': 'Phone login চালু নেই — Firebase console → Authentication → Sign-in method → Phone Enable করুন।',
    'auth/captcha-check-failed': 'স্প্যাম-সুরক্ষা যাচাই ব্যর্থ — পেজ রিফ্রেশ করে আবার দিন।',
    'auth/web-storage-unsupported': 'ব্রাউজার cookies/storage বন্ধ আছে — চালু করে আবার দিন।',
    'auth/missing-container': 'পেজ পুরো লোড হওয়ার পর আবার চেষ্টা করুন।'
  };
  if (!code) return 'যাচাই করা যায়নি। আবার চেষ্টা করুন।';
  return (m[code] || 'যাচাই করা যায়নি। আবার চেষ্টা করুন।') + ` (${code})`;
}
