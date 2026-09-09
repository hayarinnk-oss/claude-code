// Google Geocoding API クライアント(サーバー専用キーを使用。ブラウザには渡さない)
const ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    const err = new Error('GOOGLE_MAPS_SERVER_API_KEY が設定されていません。サーバーの .env を確認してください。');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const qs = new URLSearchParams({ address, language: 'ja', region: 'jp', key: apiKey });
  const res = await fetch(`${ENDPOINT}?${qs.toString()}`);
  if (!res.ok) {
    throw new Error(`Google Geocoding API エラー: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.status !== 'OK' || !json.results?.length) {
    const err = new Error(`住所が見つかりませんでした (status: ${json.status})`);
    err.code = 'NOT_FOUND';
    throw err;
  }

  const result = json.results[0];
  const components = result.address_components || [];
  const findComponent = (type) => components.find((c) => c.types.includes(type))?.long_name;

  return {
    formattedAddress: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    prefecture: findComponent('administrative_area_level_1'),
    city:
      findComponent('locality') ||
      findComponent('administrative_area_level_2') ||
      findComponent('sublocality_level_1'),
    ward: findComponent('sublocality_level_1'),
  };
}
