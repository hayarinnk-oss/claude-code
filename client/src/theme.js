/* ------------------------------------------------------------------ */
/*  デザイントークン                                                    */
/*  コンセプト: 「鑑定書」のような信頼感 + 「地形の等高線」で土地の価値を表現 */
/*  ink(墨)の背景 × brass(真鍮=価値)のアクセント × sage(土地の緑)        */
/* ------------------------------------------------------------------ */
export const C = {
  bg: '#0B0F0C',
  surface: '#12160F',
  card: '#171C15',
  cardAlt: '#0F1310',
  border: 'rgba(216,180,99,0.16)',
  borderSoft: 'rgba(241,238,230,0.08)',
  brass: '#D8B463',
  brassDim: '#8C733F',
  brassSoft: 'rgba(216,180,99,0.10)',
  brassSofter: 'rgba(216,180,99,0.05)',
  sage: '#7FB88F',
  rust: '#E08B6B',
  text: '#F1EEE6',
  textMuted: '#9A9C8F',
  textFaint: '#5C5F52',
};

export const FONT_UI = "'Noto Sans JP', 'Hiragino Sans', sans-serif";
export const FONT_SERIF = "'Shippori Mincho', 'Noto Serif JP', serif";

export const yen = (n) => `¥${Math.round(n).toLocaleString('ja-JP')}`;
export const man = (n) => `${Math.round(n).toLocaleString('ja-JP')}万円`;
