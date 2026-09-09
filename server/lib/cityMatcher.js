import { fetchCityList } from './reinfolibClient.js';

/**
 * ジオコーディング結果の市区町村名から、reinfolib(XIT002)の市区町村コードを解決する。
 * 東京23区は Google Geocoding で `sublocality_level_1`(例: 世田谷区)に入ることがあるため、
 * city -> ward の順でマッチを試みる。
 */
export async function resolveCityCode(areaCode, { city, ward }) {
  const cities = await fetchCityList(areaCode);
  const candidates = [city, ward].filter(Boolean);

  for (const name of candidates) {
    const hit = cities.find((c) => c.name === name || name.includes(c.name) || c.name.includes(name));
    if (hit) return { cityCode: hit.id, cityName: hit.name };
  }
  return null;
}
