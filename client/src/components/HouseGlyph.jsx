import { C } from '../theme.js';

/* 一軒家のラインアート */
export function HouseGlyph({ size = 108 }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 140 115" fill="none">
      <g stroke={C.brass} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M14 62 L70 18 L126 62" opacity="0.95" />
        <path d="M28 60 L28 100 L112 100 L112 60" opacity="0.85" />
        <path d="M88 34 L88 12 L102 12 L102 45" opacity="0.7" />
        <rect x="60" y="72" width="20" height="28" opacity="0.7" />
        <rect x="38" y="74" width="14" height="14" opacity="0.55" />
        <rect x="88" y="74" width="14" height="14" opacity="0.55" />
      </g>
    </svg>
  );
}
