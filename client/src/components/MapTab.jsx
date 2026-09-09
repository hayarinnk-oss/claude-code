import { useEffect, useRef } from 'react';
import { JapaneseYen } from 'lucide-react';
import { C, FONT_UI, man } from '../theme.js';
import { ContourBackground } from './ContourBackground.jsx';
import { StatCard, FilterPill } from './Small.jsx';
import { useGoogleMaps } from '../hooks/useGoogleMaps.js';
import { MAP_DARK_STYLE } from './mapDarkStyle.js';
import { makePinOverlayClass } from './pinOverlay.js';

const RADIUS_OPTIONS = [1, 3, 8];
const PERIOD_OPTIONS = [
  { months: 12, label: '直近1年間' },
  { months: 36, label: '直近3年間' },
];

function subjectBadge(report) {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.alignItems = 'center';
  el.innerHTML = `
    <div style="background:${C.brass};color:#1D1706;font-size:11px;font-weight:700;padding:6px 10px;border-radius:10px;font-family:${FONT_UI};white-space:nowrap;text-align:center;">
      ${man(report.value / 10000)}
      <div style="font-size:9px;font-weight:400;">対象物件</div>
    </div>`;
  return el;
}

function compBadge(pin) {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.gap = '4px';
  el.style.background = C.card;
  el.style.border = `1px solid ${C.border}`;
  el.style.borderRadius = '999px';
  el.style.padding = '5px 9px';
  el.style.fontSize = '11px';
  el.style.color = C.text;
  el.style.whiteSpace = 'nowrap';
  el.style.fontFamily = FONT_UI;
  el.textContent = `${man(pin.priceMan)}${pin.district ? ` (${pin.district})` : ''}`;
  return el;
}

export function MapTab({ report, radiusKm, periodMonths, onChangeFilter }) {
  const { maps, error: mapsError } = useGoogleMaps();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);

  useEffect(() => {
    if (!maps || !containerRef.current || mapRef.current) return;
    mapRef.current = new maps.Map(containerRef.current, {
      center: report.location,
      zoom: 14,
      styles: MAP_DARK_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
    });
  }, [maps, report.location]);

  useEffect(() => {
    if (!maps || !mapRef.current) return;
    mapRef.current.panTo(report.location);

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const PinOverlay = makePinOverlayClass(maps);

    const subject = new PinOverlay(report.location, subjectBadge(report));
    subject.setMap(mapRef.current);
    overlaysRef.current.push(subject);

    for (const pin of report.pins) {
      const overlay = new PinOverlay({ lat: pin.lat, lng: pin.lng }, compBadge(pin));
      overlay.setMap(mapRef.current);
      overlaysRef.current.push(overlay);
    }

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [maps, report]);

  return (
    <div>
      <div
        style={{
          position: 'relative', height: 320, borderRadius: 18, overflow: 'hidden',
          border: `1px solid ${C.border}`, background: C.cardAlt, marginBottom: 14,
        }}
      >
        {maps ? (
          <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><ContourBackground /></div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: C.textFaint, lineHeight: 1.7 }}>
                {mapsError || '地図を読み込み中です…'}
              </div>
            </div>
          </>
        )}
        <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 10, color: C.textFaint, background: 'rgba(11,15,12,0.7)', padding: '3px 8px', borderRadius: 6 }}>
          ピンの位置は取引情報の町丁目単位で近似した参考位置です
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <FilterPill
          label={`半径${radiusKm}km`}
          onClick={() => {
            const idx = RADIUS_OPTIONS.indexOf(radiusKm);
            onChangeFilter({ radiusKm: RADIUS_OPTIONS[(idx + 1) % RADIUS_OPTIONS.length] });
          }}
        />
        <FilterPill
          label={PERIOD_OPTIONS.find((p) => p.months === periodMonths)?.label || '直近1年間'}
          onClick={() => {
            const idx = PERIOD_OPTIONS.findIndex((p) => p.months === periodMonths);
            onChangeFilter({ periodMonths: PERIOD_OPTIONS[(idx + 1) % PERIOD_OPTIONS.length].months });
          }}
        />
      </div>

      <StatCard
        full
        icon={<JapaneseYen size={15} color={C.brass} />}
        label={`周辺相場(半径${radiusKm}km・${PERIOD_OPTIONS.find((p) => p.months === periodMonths)?.label})`}
        value={man(report.nearbyAvg / 10000)}
        sub={`前年比 ${report.nearbyYoy >= 0 ? '+' : ''}${report.nearbyYoy}%`}
        subPositive={report.nearbyYoy >= 0}
      />
    </div>
  );
}
