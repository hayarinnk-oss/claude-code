import { geocodeDistrict, haversineKm } from './districtGeocode.js';

const MAX_DISTRICTS = 10;

/**
 * 取引データを町丁目(DistrictName)単位で集計し、地図表示用のピン(近似座標)を作る。
 * 取引価格APIは個々の取引の緯度経度を持たないため、町丁目の代表地点で近似する。
 */
export async function buildMapPins({ comps, prefecture, cityName, subjectLocation }) {
  const byDistrict = new Map();
  for (const c of comps) {
    if (!c.district) continue;
    const bucket = byDistrict.get(c.district) || [];
    bucket.push(c.tradePrice);
    byDistrict.set(c.district, bucket);
  }

  const districts = [...byDistrict.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_DISTRICTS);

  const pins = [];
  for (const [district, prices] of districts) {
    const point = await geocodeDistrict(prefecture, cityName, district);
    if (!point) continue;
    const avgPriceMan = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 10000);
    const distanceKm = subjectLocation ? haversineKm(subjectLocation, point) : null;
    pins.push({
      district,
      lat: point.lat,
      lng: point.lng,
      priceMan: avgPriceMan,
      count: prices.length,
      distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
    });
  }
  return pins;
}
