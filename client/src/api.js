export class ApiError extends Error {}

/**
 * バックエンド(/api/property/valuate)から、指定住所+建物属性の資産価値レポートを取得する。
 * バックエンド側で 国交省 不動産情報ライブラリAPI と Google Geocoding API を呼び出し、
 * 実データから査定値・推移・将来予測・周辺相場マップ用ピンを計算して返す。
 */
export async function fetchPropertyReport({ address, age, layout, landArea, buildingArea, radiusKm, periodMonths }) {
  const params = new URLSearchParams({
    address,
    age: String(age),
    layout,
    landArea: String(landArea),
    buildingArea: String(buildingArea),
  });
  if (radiusKm) params.set('radiusKm', String(radiusKm));
  if (periodMonths) params.set('periodMonths', String(periodMonths));

  const res = await fetch(`/api/property/valuate?${params.toString()}`);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(json.error || `レポートの取得に失敗しました (${res.status})`);
  }
  return json;
}
