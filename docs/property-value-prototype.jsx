import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Share2, MoreHorizontal, MapPin, Sparkles,
  JapaneseYen, BarChart3, Clock, Calendar, ChevronDown, Info,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  デザイントークン                                                    */
/*  コンセプト: 「鑑定書」のような信頼感 + 「地形の等高線」で土地の価値を表現 */
/*  ink(墨)の背景 × brass(真鍮=価値)のアクセント × sage(土地の緑)        */
/* ------------------------------------------------------------------ */
const C = {
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

const FONT_UI = "'Noto Sans JP', 'Hiragino Sans', sans-serif";
const FONT_SERIF = "'Shippori Mincho', 'Noto Serif JP', serif";

/* ------------------------------------------------------------------ */
/*  ダミーデータ(戸建て・1都3県)                                        */
/* ------------------------------------------------------------------ */
const PROPERTIES = [
  {
    id: 'setagaya', pref: '東京都', address: '東京都世田谷区代田',
    age: 12, layout: '3LDK', land: 120.45, building: 95.20,
    value: 68500000, yoy: 8.2, rangeLow: 65200000, rangeHigh: 71800000, unitPrice: 56.9,
    trend: [5542, 6070, 6439, 6604, 6747, 6850], forecast: [7021, 7193],
    nearbyAvg: 65400000, nearbyYoy: 5.1, rankPct: 24, rankTotal: 203, rankPos: 49,
    avgDays: 54, avgDaysYoy: -6, sellWindow: '今後3ヶ月以内',
    pins: [7900, 7350, 7180, 6420],
    ai: '世田谷区は人気エリアのため取引件数が安定して多く、資産価値も緩やかな上昇が続く見込みです。',
  },
  {
    id: 'tsuzuki', pref: '神奈川県', address: '神奈川県横浜市都筑区',
    age: 8, layout: '4LDK', land: 135.80, building: 102.30,
    value: 82000000, yoy: 11.4, rangeLow: 78500000, rangeHigh: 85800000, unitPrice: 60.4,
    trend: [6634, 7265, 7708, 7905, 8077, 8200], forecast: [8405, 8610],
    nearbyAvg: 79800000, nearbyYoy: 6.8, rankPct: 15, rankTotal: 178, rankPos: 27,
    avgDays: 46, avgDaysYoy: -8, sellWindow: '今後3ヶ月以内',
    pins: [9450, 8790, 8950, 7680],
    ai: '都筑区周辺は再開発と交通利便性の向上により、資産価値の上昇ペースが周辺エリアより高い傾向です。',
  },
  {
    id: 'midori', pref: '埼玉県', address: '埼玉県さいたま市緑区',
    age: 15, layout: '4LDK', land: 150.12, building: 98.54,
    value: 52800000, yoy: 10.6, rangeLow: 50800000, rangeHigh: 54600000, unitPrice: 53.6,
    trend: [4271, 4678, 4963, 5090, 5201, 5280], forecast: [5412, 5544],
    nearbyAvg: 51900000, nearbyYoy: 7.4, rankPct: 18, rankTotal: 149, rankPos: 27,
    avgDays: 68, avgDaysYoy: -4, sellWindow: '今後6ヶ月以内',
    pins: [6150, 5720, 5860, 5140],
    ai: '周辺の再開発と取引増加により、資産価値は安定して推移すると予測されます。',
  },
  {
    id: 'kashiwa', pref: '千葉県', address: '千葉県柏市豊四季',
    age: 20, layout: '3LDK', land: 110.00, building: 88.00,
    value: 39500000, yoy: 4.1, rangeLow: 37200000, rangeHigh: 41900000, unitPrice: 35.9,
    trend: [3196, 3500, 3713, 3808, 3891, 3950], forecast: [4049, 4148],
    nearbyAvg: 38100000, nearbyYoy: 2.6, rankPct: 42, rankTotal: 156, rankPos: 66,
    avgDays: 82, avgDaysYoy: 3, sellWindow: '今後12ヶ月以内',
    pins: [4870, 4520, 4650, 3980],
    ai: '柏市郊外エリアは取引件数がやや少なく、資産価値の変動は緩やかに推移する見込みです。',
  },
];

const PERIOD_LABELS = ['23/7', '24/1', '24/7', '25/1', '25/7', '現在'];
const FORECAST_LABELS = ['26/3', '26/9'];

const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;
const man = (n) => `${n.toLocaleString('ja-JP')}万円`;

/* ------------------------------------------------------------------ */
/*  カウントアップ                                                     */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    setValue(0);
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  等高線の背景(土地=地形というコンセプトの視覚化)                       */
/* ------------------------------------------------------------------ */
function ContourBackground() {
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

/* ------------------------------------------------------------------ */
/*  一軒家のラインアート                                                */
/* ------------------------------------------------------------------ */
function HouseGlyph({ size = 108 }) {
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

/* ------------------------------------------------------------------ */
/*  グラフ用ツールチップ                                                */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload.find((x) => x.value != null);
  if (!p) return null;
  return (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, fontFamily: FONT_UI }}>{label}</div>
      <div style={{ fontSize: 14, color: C.brass, fontFamily: FONT_SERIF }}>{man(p.value)}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  メインコンポーネント                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [propIdx, setPropIdx] = useState(2);
  const [tab, setTab] = useState('overview');
  const [pickerOpen, setPickerOpen] = useState(false);
  const prop = PROPERTIES[propIdx];
  const animatedValue = useCountUp(prop.value);

  const overviewData = PERIOD_LABELS.map((label, i) => ({ label, actual: prop.trend[i] }));
  const forecastData = [
    ...PERIOD_LABELS.map((label, i) => ({
      label, actual: prop.trend[i],
      bridge: i === PERIOD_LABELS.length - 1 ? prop.trend[i] : null,
    })),
    ...FORECAST_LABELS.map((label, i) => ({ label, actual: null, bridge: prop.forecast[i] })),
  ];

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: FONT_UI, minHeight: '100%', maxWidth: 460, margin: '0 auto', paddingBottom: 32 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 6px' }}>
        <ChevronLeft size={22} color={C.textMuted} />
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.02em' }}>資産価値レポート</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <Share2 size={18} color={C.textMuted} />
          <MoreHorizontal size={18} color={C.textMuted} />
        </div>
      </div>

      <div style={{ margin: '4px 18px 14px', fontSize: 11, color: C.textFaint, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Info size={12} />
        ダミーデータによるプロトタイプです(対象:戸建て/東京・神奈川・埼玉・千葉)
      </div>

      {/* 住所ピッカー */}
      <div style={{ margin: '0 18px 14px', position: 'relative' }}>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '13px 14px', color: C.text, fontSize: 14, fontFamily: FONT_UI,
          }}
        >
          <MapPin size={16} color={C.brass} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>{prop.address}</span>
          <ChevronDown size={16} color={C.textMuted} />
        </button>

        {pickerOpen && (
          <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {PROPERTIES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setPropIdx(i); setPickerOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px',
                  background: i === propIdx ? C.brassSofter : 'transparent',
                  border: 'none', borderBottom: i < PROPERTIES.length - 1 ? `1px solid ${C.borderSoft}` : 'none',
                  color: C.text, fontSize: 13, fontFamily: FONT_UI,
                }}
              >
                <div>{p.address}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  築{p.age}年 ・ {p.layout} ・ 推定 {(p.value / 10000).toLocaleString('ja-JP')}万円
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 物件タグ */}
      <div style={{ display: 'flex', gap: 8, margin: '0 18px 18px', flexWrap: 'wrap' }}>
        {[
          { label: '戸建て', active: true },
          { label: `築${prop.age}年` },
          { label: prop.layout },
          { label: `土地 ${prop.land}㎡` },
          { label: `建物 ${prop.building}㎡` },
        ].map((tg) => (
          <span key={tg.label} style={{
            fontSize: 12, padding: '6px 12px', borderRadius: 999,
            background: tg.active ? C.brassSoft : 'transparent',
            color: tg.active ? C.brass : C.textMuted,
            border: `1px solid ${tg.active ? C.brassDim : C.borderSoft}`,
          }}>{tg.label}</span>
        ))}
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', margin: '0 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
        {[
          { key: 'overview', label: '概要' },
          { key: 'map', label: '相場マップ' },
          { key: 'forecast', label: '将来予測' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '10px 0', background: 'transparent', border: 'none',
              color: tab === t.key ? C.brass : C.textMuted,
              fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              borderBottom: tab === t.key ? `2px solid ${C.brass}` : '2px solid transparent',
              fontFamily: FONT_UI,
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '18px' }}>
        {tab === 'overview' && (
          <>
            {/* 推定資産価値 HERO */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: `linear-gradient(180deg, ${C.card} 0%, ${C.cardAlt} 100%)`,
              border: `1px solid ${C.border}`, borderTop: `2px solid ${C.brass}`,
              borderRadius: 18, padding: 22, marginBottom: 16,
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.7 }}>
                <ContourBackground />
              </div>
              <div style={{ position: 'absolute', top: 8, right: 4 }}>
                <HouseGlyph size={100} />
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  家の推定資産価値
                </div>
                <div style={{ fontSize: 36, fontFamily: FONT_SERIF, fontWeight: 600, letterSpacing: '0.01em', color: C.text }}>
                  {yen(animatedValue)}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8, marginBottom: 20 }}>
                  <span style={{ color: C.sage, fontSize: 13, fontFamily: FONT_UI, fontWeight: 600 }}>▲ {prop.yoy}%</span>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>前年比</span>
                </div>
                <div style={{ display: 'flex', borderTop: `1px solid ${C.borderSoft}`, paddingTop: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>査定レンジ</div>
                    <div style={{ fontSize: 13, fontFamily: FONT_UI }}>
                      {(prop.rangeLow / 10000).toLocaleString('ja-JP')}万円〜{(prop.rangeHigh / 10000).toLocaleString('ja-JP')}万円
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>㎡単価</div>
                    <div style={{ fontSize: 13, fontFamily: FONT_UI }}>{prop.unitPrice}万円</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 推移グラフ(カード枠なし、区切り線のみで軽さを出す) */}
            <div style={{ padding: '4px 4px 18px', marginBottom: 16, borderBottom: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>資産価値の推移(3年)</div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke={C.borderSoft} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={{ stroke: C.borderSoft }} tickLine={false} />
                    <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="actual" stroke={C.brass} strokeWidth={2.5} dot={{ r: 3, fill: C.brass, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 統計4カラム */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <StatCard icon={<JapaneseYen size={15} color={C.brass} />} label="周辺相場" value={man(prop.nearbyAvg / 10000)} sub={`前年比 +${prop.nearbyYoy}%`} subPositive />
              <StatCard icon={<BarChart3 size={15} color={C.brass} />} label="エリア内" value={`上位${prop.rankPct}%`} sub={`${prop.rankTotal}件中${prop.rankPos}位`} />
              <StatCard icon={<Clock size={15} color={C.brass} />} label="成約平均" value={`${prop.avgDays}日`} sub={`前年比 ${prop.avgDaysYoy > 0 ? '+' : ''}${prop.avgDaysYoy}日`} />
              <StatCard icon={<Calendar size={15} color={C.brass} />} label="売却時期" value={prop.sellWindow} sub="需要期に入りやすい" />
            </div>

            {/* AI分析(引用ブロック風) */}
            <div style={{ borderLeft: `2px solid ${C.brass}`, paddingLeft: 14, display: 'flex', gap: 10 }}>
              <Sparkles size={16} color={C.brass} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>AIによる分析(ダミー)</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{prop.ai}</div>
              </div>
            </div>
          </>
        )}

        {tab === 'map' && (
          <div>
            <div style={{
              position: 'relative', height: 320, borderRadius: 18, overflow: 'hidden',
              border: `1px solid ${C.border}`, background: C.cardAlt, marginBottom: 14,
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><ContourBackground /></div>
              <MapPinBadge value={PROPERTIES[propIdx].pins[0]} top="12%" left="62%" />
              <MapPinBadge value={PROPERTIES[propIdx].pins[1]} top="55%" left="14%" />
              <MapPinBadge value={PROPERTIES[propIdx].pins[2]} top="46%" left="80%" />
              <MapPinBadge value={PROPERTIES[propIdx].pins[3]} top="72%" left="30%" />
              <div style={{ position: 'absolute', top: '42%', left: '46%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: C.brass, color: '#1D1706', fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 10, fontFamily: FONT_UI, whiteSpace: 'nowrap' }}>
                  {man(prop.value / 10000)}
                  <div style={{ fontSize: 9, fontWeight: 400 }}>対象物件</div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 10, color: C.textFaint, background: 'rgba(11,15,12,0.7)', padding: '3px 8px', borderRadius: 6 }}>
                地図は簡易表示です(本番はGoogle Maps APIに置き換え予定)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <FilterPill label="半径3km" />
              <FilterPill label="直近1年間" />
            </div>

            <StatCard full icon={<JapaneseYen size={15} color={C.brass} />} label="周辺相場(半径3km・直近1年)" value={man(prop.nearbyAvg / 10000)} sub={`前年比 +${prop.nearbyYoy}%`} subPositive />
          </div>
        )}

        {tab === 'forecast' && (
          <>
            <div style={{ padding: '4px 4px 18px', marginBottom: 16, borderBottom: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>実績データからの単純トレンド予測</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke={C.borderSoft} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={{ stroke: C.borderSoft }} tickLine={false} />
                    <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="actual" stroke={C.brass} strokeWidth={2.5} dot={{ r: 3, fill: C.brass, strokeWidth: 0 }} connectNulls={false} />
                    <Line type="monotone" dataKey="bridge" stroke={C.brass} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: C.bg, stroke: C.brass, strokeWidth: 2 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <Legend dashed={false} label="実績" />
                <Legend dashed label="予測(参考値)" />
              </div>
            </div>

            <div style={{ borderLeft: `2px solid ${C.brass}`, paddingLeft: 14 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>予測についての注記</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                過去{PERIOD_LABELS.length}時点の実績データを直線的に延長した、単純トレンドによる参考値です。
                今後{FORECAST_LABELS.length}期先の予測で、約{man(prop.forecast[prop.forecast.length - 1])}前後になると見込まれます。
                周辺開発計画や金利変動などは考慮していません。
              </div>
            </div>
          </>
        )}
      </div>

      {/* 免責事項 */}
      <div style={{ margin: '8px 18px 0', paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
        <div style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.7 }}>
          本レポートはダミーデータによるプロトタイプ画面です。実際の公示地価・路線価・取引価格データとは連動していません。
          本サービスは不動産鑑定士による正式な鑑定ではなく、参考推定値の表示を目的としています。
          正式な価格評価については不動産鑑定士にご相談ください。
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  小さな部品                                                         */
/* ------------------------------------------------------------------ */
function StatCard({ icon, label, value, sub, subPositive, full }) {
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

function MapPinBadge({ value, top, left }) {
  return (
    <div style={{ position: 'absolute', top, left, transform: 'translate(-50%,-50%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.card, border: `1px solid ${C.border}`, borderRadius: 999, padding: '5px 9px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>
        <MapPin size={11} color={C.brass} />
        {man(value)}
      </div>
    </div>
  );
}

function FilterPill({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 999, padding: '7px 12px', color: C.textMuted }}>
      {label}
      <ChevronDown size={12} />
    </div>
  );
}

function Legend({ dashed, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 16, height: 0, borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${C.brass}` }} />
      <span style={{ fontSize: 11, color: C.textMuted }}>{label}</span>
    </div>
  );
}
