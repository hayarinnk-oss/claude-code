import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { JapaneseYen, BarChart3, Clock, Calendar, Sparkles } from 'lucide-react';
import { C, FONT_SERIF, yen, man } from '../theme.js';
import { ContourBackground } from './ContourBackground.jsx';
import { HouseGlyph } from './HouseGlyph.jsx';
import { ChartTooltip, StatCard } from './Small.jsx';
import { useCountUp } from '../hooks/useCountUp.js';

export function OverviewTab({ report }) {
  const animatedValue = useCountUp(report.value);
  const overviewData = report.periodLabels.map((label, i) => ({ label, actual: report.trend[i] }));

  return (
    <>
      <div
        style={{
          position: 'relative', overflow: 'hidden',
          background: `linear-gradient(180deg, ${C.card} 0%, ${C.cardAlt} 100%)`,
          border: `1px solid ${C.border}`, borderTop: `2px solid ${C.brass}`,
          borderRadius: 18, padding: 22, marginBottom: 16,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.7 }}>
          <ContourBackground />
        </div>
        <div style={{ position: 'absolute', top: 8, right: 4 }}>
          <HouseGlyph size={100} />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>家の推定資産価値</div>
          <div style={{ fontSize: 36, fontFamily: FONT_SERIF, fontWeight: 600, letterSpacing: '0.01em', color: C.text }}>
            {yen(animatedValue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8, marginBottom: 20 }}>
            <span style={{ color: report.yoy >= 0 ? C.sage : C.rust, fontSize: 13, fontWeight: 600 }}>
              {report.yoy >= 0 ? '▲' : '▼'} {Math.abs(report.yoy)}%
            </span>
            <span style={{ color: C.textMuted, fontSize: 12 }}>前年比</span>
          </div>
          <div style={{ display: 'flex', borderTop: `1px solid ${C.borderSoft}`, paddingTop: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>査定レンジ</div>
              <div style={{ fontSize: 13 }}>
                {(report.rangeLow / 10000).toLocaleString('ja-JP')}万円〜{(report.rangeHigh / 10000).toLocaleString('ja-JP')}万円
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>㎡単価</div>
              <div style={{ fontSize: 13 }}>{report.unitPrice}万円</div>
            </div>
          </div>
        </div>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard icon={<JapaneseYen size={15} color={C.brass} />} label="周辺相場" value={man(report.nearbyAvg / 10000)} sub={`前年比 ${report.nearbyYoy >= 0 ? '+' : ''}${report.nearbyYoy}%`} subPositive={report.nearbyYoy >= 0} />
        <StatCard icon={<BarChart3 size={15} color={C.brass} />} label="エリア内" value={`上位${report.rankPct}%`} sub={`${report.rankTotal}件中${report.rankPos}位`} />
        <StatCard icon={<Clock size={15} color={C.brass} />} label="成約平均" value={`${report.avgDays}日`} sub={`前年比 ${report.avgDaysYoy > 0 ? '+' : ''}${report.avgDaysYoy}日(取引頻度からの目安)`} />
        <StatCard icon={<Calendar size={15} color={C.brass} />} label="売却時期" value={report.sellWindow} sub="需要期に入りやすい" />
      </div>

      <div style={{ borderLeft: `2px solid ${C.brass}`, paddingLeft: 14, display: 'flex', gap: 10 }}>
        <Sparkles size={16} color={C.brass} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>AIによる分析(実績データからの自動生成)</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{report.ai}</div>
        </div>
      </div>
    </>
  );
}
