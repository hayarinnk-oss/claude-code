import { C } from '../theme.js';

/* 等高線の背景(土地=地形というコンセプトの視覚化) */
export function ContourBackground() {
  const lines = [
    { d: 'M-10,150 C 80,120 140,170 230,140 C 300,120 360,150 420,130', o: 0.5 },
    { d: 'M-10,115 C 60,90 150,130 220,105 C 300,80 350,110 420,95', o: 0.38 },
    { d: 'M-10,80 C 70,60 130,95 210,72 C 290,52 340,75 420,60', o: 0.26 },
    { d: 'M-10,45 C 60,30 140,58 220,40 C 290,25 350,42 420,30', o: 0.16 },
  ];
  return (
    <svg viewBox="0 0 420 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {lines.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke={C.brass} strokeWidth="1" opacity={l.o} />
      ))}
    </svg>
  );
}
