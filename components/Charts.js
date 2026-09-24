'use client';
// হালকা চার্ট (লাইব্রেরি ছাড়া CSS/SVG) — লো-এন্ড মোবাইলে দ্রুত
export function BarChart({ data, color = 'bg-blood-600' }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label}>
          <div className="flex justify-between text-xs font-bold mb-1"><span>{d.label}</span><span className="tabular-nums">{d.value}</span></div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.round((d.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data, size = 140 }) {
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  const colors = ['#b91c1c', '#f59e0b', '#16a34a', '#3b82f6', '#8b5cf6', '#6b7280', '#ec4899', '#14b8a6'];
  let acc = 0;
  const segs = data.map((d, i) => {
    const frac = d.value / total;
    const s = { ...d, from: acc, to: acc + frac, color: colors[i % colors.length] };
    acc += frac;
    return s;
  });
  const R = 54, C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="বণ্টন চার্ট">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#f3f4f6" strokeWidth="18" />
        {segs.map(s => (
          <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="18"
            strokeDasharray={`${(s.to - s.from) * C} ${C}`} strokeDashoffset={-s.from * C}
            transform="rotate(-90 70 70)" strokeLinecap="butt" />
        ))}
        <text x="70" y="76" textAnchor="middle" fontWeight="800" fontSize="22">{total}</text>
      </svg>
      <ul className="space-y-1 text-xs font-semibold">
        {segs.map(s => <li key={s.label} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />{s.label} — {s.value}</li>)}
      </ul>
    </div>
  );
}

export function MiniBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-24" aria-hidden="true">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1" title={`${d.label}: ${d.value}`}>
          <div className="w-full bg-gradient-to-t from-blood-700 to-blood-500 rounded-t-md transition-all duration-700" style={{ height: `${Math.max(6, Math.round((d.value / max) * 88))}px` }} />
          <span className="text-[10px] text-gray-400 font-bold">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
