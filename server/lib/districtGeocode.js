import { geocodeAddress } from './googleGeocode.js';

// 町丁目名 -> 座標 のキャッシュ(取引価格APIは地番レベルの緯度経度を持たないため、
// 地図表示用に町丁目の代表地点をジオコーディングして近似する)
const districtCache = new Map();

export async function geocodeDistrict(prefecture, city, districtName) {
  const key = `${prefecture}${city}${districtName || ''}`;
  if (districtCache.has(key)) return districtCache.get(key);

  try {
    const result = await geocodeAddress(key);
    const point = { lat: result.lat, lng: result.lng };
    districtCache.set(key, point);
    return point;
  } catch {
    districtCache.set(key, null);
    return null;
  }
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
