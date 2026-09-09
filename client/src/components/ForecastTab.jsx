import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { C, man } from '../theme.js';
import { ChartTooltip, Legend } from './Small.jsx';

export function ForecastTab({ report }) {
  const forecastLabels = report.forecastLabels || [];
  const forecastData = [
    ...report.periodLabels.map((label, i) => ({
      label,
      actual: report.trend[i],
      bridge: i === report.periodLabels.length - 1 ? report.trend[i] : null,
    })),
    ...forecastLabels.map((label, i) => ({ label, actual: null, bridge: report.forecast[i] })),
  ];

  return (
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
          過去{report.periodLabels.length}時点(半期ごと)の実績データを単純な直線トレンドで延長した参考値です。
          今後{forecastLabels.length}期先の予測で、約{man(report.forecast[report.forecast.length - 1])}前後になると見込まれます。
          周辺の再開発計画や金利変動などの外部要因は考慮していません。
        </div>
      </div>
    </>
  );
}
