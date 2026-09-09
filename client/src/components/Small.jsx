import { ChevronDown } from 'lucide-react';
import { C, FONT_UI, man } from '../theme.js';

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload.find((x) => x.value != null);
  if (!p) return null;
  return (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, fontFamily: FONT_UI }}>{label}</div>
      <div style={{ fontSize: 14, color: C.brass, fontFamily: 'inherit' }}>{man(p.value)}</div>
    </div>
  );
}

export function StatCard({ icon, label, value, sub, subPositive, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined, background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 11, color: C.textMuted }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_UI }}>{value}</div>
      <div style={{ fontSize: 11, color: subPositive ? C.sage : C.textFaint }}>{sub}</div>
    </div>
  );
}

export function FilterPill({ label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
        background: active ? C.brassSoft : C.surface,
        border: `1px solid ${active ? C.brassDim : C.borderSoft}`,
        borderRadius: 999, padding: '7px 12px', color: active ? C.brass : C.textMuted,
        fontFamily: FONT_UI, cursor: 'pointer',
      }}
    >
      {label}
      <ChevronDown size={12} />
    </button>
  );
}

export function Legend({ dashed, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 16, height: 0, borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${C.brass}` }} />
      <span style={{ fontSize: 11, color: C.textMuted }}>{label}</span>
    </div>
  );
}
