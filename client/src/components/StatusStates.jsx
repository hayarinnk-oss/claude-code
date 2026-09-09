import { AlertTriangle, Home } from 'lucide-react';
import { C, FONT_UI } from '../theme.js';
import { ContourBackground } from './ContourBackground.jsx';
import { HouseGlyph } from './HouseGlyph.jsx';

export function EmptyState() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', border: `1px solid ${C.borderSoft}`, borderRadius: 18, padding: '40px 22px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}><ContourBackground /></div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <HouseGlyph size={72} />
        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
          住所を入力して検索すると、国交省の公開データをもとにした
          <br />
          資産価値レポートを表示します。
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <Home size={28} color={C.brass} style={{ opacity: 0.7 }} />
      <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted, fontFamily: FONT_UI }}>
        国交省の取引データを集計しています…
      </div>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: 16, background: 'rgba(224,139,107,0.08)', border: `1px solid ${C.rust}`, borderRadius: 12 }}>
      <AlertTriangle size={18} color={C.rust} style={{ flexShrink: 0 }} />
      <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{message}</div>
    </div>
  );
}
