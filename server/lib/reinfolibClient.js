// 国土交通省「不動産情報ライブラリ」公式API クライアント
// 仕様: https://www.reinfolib.mlit.go.jp/help/apiManual/
// 認証: HTTPヘッダー `Ocp-Apim-Subscription-Key` にAPIキーを付与する。
const BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external';

const cache = new Map(); // url -> { expires, data }

async function getJson(path, params, ttlMs) {
  const apiKey = process.env.REINFOLIB_API_KEY;
  if (!apiKey) {
    const err = new Error('REINFOLIB_API_KEY が設定されていません。サーバーの .env を確認してください。');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const url = `${BASE_URL}/${path}?${qs.toString()}`;

  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const res = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`reinfolib API エラー (${path}): ${res.status} ${res.statusText} ${body}`.trim());
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  cache.set(url, { data: json, expires: Date.now() + ttlMs });
  return json;
}

/**
 * XIT001: 不動産価格(取引価格・成約価格)情報取得API
 * 戸建て(宅地(土地と建物))の取引データを、指定した都道府県・市区町村・四半期で取得する。
 */
export async function fetchTradePrices({ areaCode, cityCode, year, quarter }) {
  const json = await getJson(
    'XIT001',
    {
      year,
      quarter,
      area: areaCode,
      city: cityCode,
      priceClassification: '01', // 01: 不動産取引価格情報
    },
    1000 * 60 * 60 * 6 // 6時間キャッシュ(四半期データはほぼ不変)
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * XIT002: 都道府県内市区町村一覧取得API
 */
export async function fetchCityList(areaCode) {
  const json = await getJson('XIT002', { area: areaCode }, 1000 * 60 * 60 * 24);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * 直近 yearsBack 年分(四半期ごと)の取引価格情報をまとめて取得する。
 * XIT001は year+quarter の単位でしか取得できないため、四半期ごとに並列でリクエストする。
 * まだ集計が公表されていない四半期はAPIがエラー/空を返すことがあるため、失敗した呼び出しは無視する。
 */
export async function fetchRecentTradePrices({ areaCode, cityCode, yearsBack = 4 }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

  const targets = [];
  for (let y = currentYear - yearsBack + 1; y <= currentYear; y++) {
    for (let q = 1; q <= 4; q++) {
      if (y === currentYear && q > currentQuarter) continue;
      targets.push({ year: y, quarter: q });
    }
  }

  const results = await Promise.allSettled(
    targets.map(({ year, quarter }) => fetchTradePrices({ areaCode, cityCode, year, quarter }))
  );

  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
}
