import { useState } from 'react';
import { ChevronLeft, Share2, MoreHorizontal, Info } from 'lucide-react';
import { C, FONT_UI } from './theme.js';
import { AddressSearchForm } from './components/AddressSearchForm.jsx';
import { OverviewTab } from './components/OverviewTab.jsx';
import { MapTab } from './components/MapTab.jsx';
import { ForecastTab } from './components/ForecastTab.jsx';
import { Disclaimer } from './components/Disclaimer.jsx';
import { EmptyState, LoadingState, ErrorState } from './components/StatusStates.jsx';
import { usePropertyReport } from './hooks/usePropertyReport.js';

const TABS = [
  { key: 'overview', label: '概要' },
  { key: 'map', label: '相場マップ' },
  { key: 'forecast', label: '将来予測' },
];

export default function App() {
  const [tab, setTab] = useState('overview');
  const [radiusKm, setRadiusKm] = useState(3);
  const [periodMonths, setPeriodMonths] = useState(12);
  const { data: report, status, error, search, setMapFilter } = usePropertyReport();

  function handleSearch(query) {
    search({ ...query, radiusKm, periodMonths });
  }

  function handleMapFilterChange(patch) {
    if (patch.radiusKm) setRadiusKm(patch.radiusKm);
    if (patch.periodMonths) setPeriodMonths(patch.periodMonths);
    setMapFilter(patch);
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: FONT_UI, minHeight: '100%', maxWidth: 460, margin: '0 auto', paddingBottom: 32 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

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
        国土交通省「不動産情報ライブラリ」の公開データを使用(対象:戸建て/東京・神奈川・埼玉・千葉)
      </div>

      <AddressSearchForm onSearch={handleSearch} loading={status === 'loading'} />

      {status === 'idle' && (
        <div style={{ padding: '0 18px' }}>
          <EmptyState />
        </div>
      )}

      {status === 'loading' && <LoadingState />}

      {status === 'error' && (
        <div style={{ padding: '0 18px' }}>
          <ErrorState message={error} />
        </div>
      )}

      {status === 'success' && report && (
        <>
          <div style={{ margin: '0 18px 0', fontSize: 12, color: C.textMuted, padding: '2px 0 14px' }}>{report.address}</div>

          <div style={{ display: 'flex', margin: '0 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '10px 0', background: 'transparent', border: 'none',
                  color: tab === t.key ? C.brass : C.textMuted,
                  fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                  borderBottom: tab === t.key ? `2px solid ${C.brass}` : '2px solid transparent',
                  fontFamily: FONT_UI, cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '18px' }}>
            {tab === 'overview' && <OverviewTab report={report} />}
            {tab === 'map' && (
              <MapTab report={report} radiusKm={radiusKm} periodMonths={periodMonths} onChangeFilter={handleMapFilterChange} />
            )}
            {tab === 'forecast' && <ForecastTab report={report} />}
          </div>
        </>
      )}

      <Disclaimer />
    </div>
  );
}
