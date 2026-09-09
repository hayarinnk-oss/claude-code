import { Router } from 'express';
import { geocodeAddress } from '../lib/googleGeocode.js';
import { prefCodeFromName } from '../lib/prefCodes.js';
import { resolveCityCode } from '../lib/cityMatcher.js';
import { fetchRecentTradePrices } from '../lib/reinfolibClient.js';
import { computeReport, getForecastLabels, InsufficientDataError } from '../lib/valuation.js';
import { buildMapPins } from '../lib/mapPins.js';

export const propertyRouter = Router();

const DEFAULT_SUBJECT = { age: 15, layout: '3LDK', landArea: 120, buildingArea: 95 };

propertyRouter.get('/valuate', async (req, res) => {
  const address = String(req.query.address || '').trim();
  if (!address) {
    return res.status(400).json({ error: '住所を入力してください。' });
  }

  const subject = {
    age: clampNumber(req.query.age, DEFAULT_SUBJECT.age, 0, 80),
    layout: String(req.query.layout || DEFAULT_SUBJECT.layout),
    landArea: clampNumber(req.query.landArea, DEFAULT_SUBJECT.landArea, 10, 2000),
    buildingArea: clampNumber(req.query.buildingArea, DEFAULT_SUBJECT.buildingArea, 10, 1000),
  };

  try {
    const geo = await geocodeAddress(address);

    const prefCode = prefCodeFromName(geo.prefecture);
    if (!prefCode) {
      return res.status(400).json({
        error: `対象エリア外の住所です。本サービスは東京都・神奈川県・埼玉県・千葉県の戸建てのみに対応しています(検出された都道府県: ${geo.prefecture || '不明'})。`,
      });
    }

    const cityMatch = await resolveCityCode(prefCode, geo);
    if (!cityMatch) {
      return res.status(404).json({ error: `市区町村を特定できませんでした(${geo.formattedAddress})。` });
    }

    const rawTrades = await fetchRecentTradePrices({ areaCode: prefCode, cityCode: cityMatch.cityCode });
    const report = computeReport({ rawTrades, subject, cityName: cityMatch.cityName });

    const radiusKm = clampNumber(req.query.radiusKm, 3, 1, 20);
    const periodMonths = clampNumber(req.query.periodMonths, 12, 12, 36);
    const pinComps = periodMonths > 12 ? report.comps : report.recentComps;
    const pins = await buildMapPins({
      comps: pinComps,
      prefecture: geo.prefecture,
      cityName: cityMatch.cityName,
      subjectLocation: { lat: geo.lat, lng: geo.lng },
    });
    const filteredPins = pins.filter((p) => p.distanceKm == null || p.distanceKm <= radiusKm);

    res.json({
      address: geo.formattedAddress,
      prefecture: geo.prefecture,
      city: cityMatch.cityName,
      location: { lat: geo.lat, lng: geo.lng },
      subject,
      age: subject.age,
      layout: subject.layout,
      land: subject.landArea,
      building: subject.buildingArea,
      value: report.value,
      yoy: report.yoy,
      rangeLow: report.rangeLow,
      rangeHigh: report.rangeHigh,
      unitPrice: report.unitPrice,
      trend: report.trend,
      forecast: report.forecast,
      periodLabels: report.buckets.map((b) => b.label),
      forecastLabels: getForecastLabels(report.buckets),
      nearbyAvg: report.nearbyAvg,
      nearbyYoy: report.nearbyYoy,
      rankPct: report.rankPct,
      rankTotal: report.rankTotal,
      rankPos: report.rankPos,
      avgDays: report.avgDays,
      avgDaysYoy: report.avgDaysYoy,
      sellWindow: report.sellWindow,
      ai: report.ai,
      pins: filteredPins,
      radiusKm,
      periodMonths,
      methodology: report.methodology,
    });
  } catch (err) {
    handleError(res, err);
  }
});

function clampNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function handleError(res, err) {
  if (err instanceof InsufficientDataError) {
    return res.status(404).json({ error: err.message });
  }
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({ error: err.message });
  }
  if (err.code === 'MISSING_API_KEY') {
    return res.status(500).json({ error: err.message });
  }
  console.error(err);
  return res.status(502).json({ error: '外部APIとの通信でエラーが発生しました。時間をおいて再度お試しください。' });
}
