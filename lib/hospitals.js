// হাসপাতাল ডিরেক্টরি — প্রতি জেলায় সদর হাসপাতাল + পরিচিত মেডিকেল কলেজ হাসপাতাল।
// জেলা বাছলে শুধু ওই জেলার হাসপাতাল দেখানো হয় (request form dependent dropdown)।
import { DISTRICTS, disName } from './bd-geo';

const MEDICAL_COLLEGES = [
  ['dmch', 'ঢাকা মেডিকেল কলেজ হাসপাতাল', 'dhaka'],
  ['cmch', 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', 'chattogram'],
  ['kmch', 'খুলনা মেডিকেল কলেজ হাসপাতাল', 'khulna'],
  ['rmch', 'রাজশাহী মেডিকেল কলেজ হাসপাতাল', 'rajshahi'],
  ['somch', 'সিলেট এমএজি ওসমানী মেডিকেল কলেজ হাসপাতাল', 'sylhet'],
  ['sbmc', 'বরিশাল শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল', 'barisal'],
  ['rangpur-mch', 'রংপুর মেডিকেল কলেজ হাসপাতাল', 'rangpur'],
  ['mmch', 'ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল', 'mymensingh'],
  ['comch', 'কুমিল্লা মেডিকেল কলেজ হাসপাতাল', 'comilla'],
  ['dinajpur-mch', 'দিনাজপুর মেডিকেল কলেজ হাসপাতাল', 'dinajpur'],
  ['bogura-mch', 'বগুড়া শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল', 'bogura'],
  ['faridpur-mch', 'ফরিদপুর মেডিকেল কলেজ হাসপাতাল', 'faridpur'],
  ['tangail-mch', 'টাঙ্গাইল শহীদ তাজউদ্দীন মেডিকেল কলেজ হাসপাতাল', 'tangail'],
  ['jashore-mch', 'যশোর মেডিকেল কলেজ হাসপাতাল', 'jashore'],
  ['pabna-mch', 'পাবনা মেডিকেল কলেজ হাসপাতাল', 'pabna'],
  ['kushtia-mch', 'কুষ্টিয়া মেডিকেল কলেজ হাসপাতাল', 'kushtia'],
  ['noakhali-mch', 'নোয়াখালী মেডিকেল কলেজ হাসপাতাল', 'noakhali']
];

const SADAR = DISTRICTS.map(d => ({
  id: `${d.id}-sadar-hospital`,
  name: `${d.name} Sadar Hospital`,
  name_bn: `${d.name_bn} সদর হাসপাতাল`,
  district_id: d.id,
  verified: false
}));

export const HOSPITALS = [
  ...MEDICAL_COLLEGES.map(([id, name_bn, district_id]) => ({ id, name: name_bn, name_bn, district_id, verified: true })),
  ...SADAR
];

const hospMap = Object.fromEntries(HOSPITALS.map(h => [h.id, h]));
export function hospName(id) { return (hospMap[id] && hospMap[id].name_bn) || ''; }
export function hospitalsByDistrict(districtId) {
  if (!districtId) return [];
  return HOSPITALS.filter(h => h.district_id === districtId);
}
export { disName };
