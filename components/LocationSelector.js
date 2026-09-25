'use client';
import { DIVISIONS, DISTRICTS, UPAZILAS } from '@/lib/locations';
import { Select } from './ui';
export default function LocationSelector({ division, district, upazila, onChange }) {
  const dists = DISTRICTS.filter(d => !division || d.division_id === division);
  const upas = UPAZILAS.filter(u => !district || u.district_id === district);
  return (
    <div className="grid sm:grid-cols-3 gap-2">
      <Select label="বিভাগ" value={division || ''} onChange={e => onChange({ division: e.target.value, district: '', upazila: '' })}>
        <option value="">নির্বাচন করুন</option>
        {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
      </Select>
      <Select label="জেলা" value={district || ''} onChange={e => onChange({ division, district: e.target.value, upazila: '' })}>
        <option value="">নির্বাচন করুন</option>
        {dists.map(d => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
      </Select>
      <Select label="উপজেলা" value={upazila || ''} onChange={e => onChange({ division, district, upazila: e.target.value })}>
        <option value="">নির্বাচন করুন</option>
        {upas.map(d => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
      </Select>
    </div>
  );
}
