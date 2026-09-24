export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
export const URGENCY = [
  { value: 'normal', label: '🟢 সাধারণ' },
  { value: 'urgent', label: '🟠 জরুরি' },
  { value: 'critical', label: '🔴 অত্যন্ত জরুরি' }
];
export const URGENCY_LABEL = { normal: '🟢 সাধারণ', urgent: '🟠 জরুরি', critical: '🔴 অত্যন্ত জরুরি' };
export const STATUS_LABEL = {
  DRAFT: 'খসড়া', PENDING_REVIEW: 'পর্যালোচনায়', ACTIVE: 'সক্রিয়',
  PARTIALLY_FULFILLED: 'আংশিক পূরণ', FULFILLED: 'রক্তের ব্যবস্থা হয়েছে',
  EXPIRED: 'মেয়াদ শেষ', CANCELLED: 'বাতিল', REJECTED: 'প্রত্যাখ্যাত'
};
export const REPORT_REASONS = ['ভুয়া অনুরোধ', 'ভুল তথ্য', 'রক্তের ব্যবস্থা হয়ে গেছে', 'স্প্যাম', 'হয়রানি', 'অন্যান্য'];
export const ROLES = ['USER', 'DONOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
