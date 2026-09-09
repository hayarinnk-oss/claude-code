import { parsePeriod, toSeireki } from './wareki.js';

const DETACHED_HOUSE_TYPE = '宅地(土地と建物)';
const MIN_UNIT_PRICE = 20000; // 円/㎡ (異常値除外の下限)
const MAX_UNIT_PRICE = 3000000; // 円/㎡ (異常値除外の上限)
const AGE_ADJUSTMENT_PER_YEAR = 0.01; // 築年数が比較対象より1年古い/新しいごとの価格調整率

// 取引価格API(XIT001)の「宅地(土地と建物)」は土地・建物込みの総額のため、
// TradePrice / Area(土地面積)は「土地1㎡あたりの土地+建物込み単価」として扱う。
// 建物価格を別途積み上げると二重計上になるため、本ロジックでは行わない。

export class InsufficientDataError extends Error {}

function average(nums) {
  const valid = nums.filter((n) => Number.isFinite(n));
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function median(nums) {
  const valid = nums.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!valid.length) return null;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2;
}

function stddev(nums) {
  const valid = nums.filter((n) => Number.isFinite(n));
  if (valid.length < 2) return 0;
  const m = average(valid);
  return Math.sqrt(average(valid.map((n) => (n - m) ** 2)));
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

/** 取引価格APIの生レコードを、査定計算で使う正規化された形に変換する */
export function normalizeTrades(rawTrades) {
  const out = [];
  for (const t of rawTrades) {
    if (t.Type !== DETACHED_HOUSE_TYPE) continue;
    const tradePrice = Number(t.TradePrice);
    const area = Number(t.Area);
    const period = parsePeriod(t.Period);
    if (!tradePrice || !area || area <= 0 || !period) continue;
    const pricePerSqm = tradePrice / area;
    if (pricePerSqm < MIN_UNIT_PRICE || pricePerSqm > MAX_UNIT_PRICE) continue;

    out.push({
      tradePrice,
      area,
      totalFloorArea: Number(t.TotalFloorArea) || null,
      builtYear: toSeireki(t.BuildingYear),
      structure: t.Structure || null,
      district: t.DistrictName || null,
      period,
      pricePerSqm,
    });
  }
  return out;
}

/** 直近3年を6つの半期(半年)バケットに分割する。最新バケットのラベルは「現在」 */
export function getHalfYearBuckets(referenceDate = new Date(), count = 6) {
  let year = referenceDate.getFullYear();
  let half = referenceDate.getMonth() < 6 ? 1 : 2;
  const raw = [];
  for (let i = 0; i < count; i++) {
    raw.unshift({ year, half });
    half -= 1;
    if (half === 0) {
      half = 2;
      year -= 1;
    }
  }
  return raw.map((b, idx) => ({
    year: b.year,
    half: b.half,
    quarters: b.half === 1 ? [1, 2] : [3, 4],
    label: idx === raw.length - 1 ? '現在' : `${String(b.year).slice(2)}/${b.half === 1 ? '1' : '7'}`,
  }));
}

export function getForecastLabels(buckets, count = 2) {
  let { year, half } = buckets[buckets.length - 1];
  const labels = [];
  for (let i = 0; i < count; i++) {
    half += 1;
    if (half > 2) {
      half = 1;
      year += 1;
    }
    labels.push(`${String(year).slice(2)}/${half === 1 ? '3' : '9'}`);
  }
  return labels;
}

function inBucket(period, bucket) {
  return period.year === bucket.year && bucket.quarters.includes(period.quarter);
}

/** 直近12ヶ月分に相当する、バケット末尾から数えた四半期数 */
const RECENT_QUARTERS = 4;

function isWithinLastNQuarters(period, buckets, n) {
  const latest = buckets[buckets.length - 1];
  const latestIndex = latest.year * 4 + latest.quarters[latest.quarters.length - 1];
  const target = period.year * 4 + period.quarter;
  return latestIndex - target < n && latestIndex - target >= 0;
}

function linearRegression(values) {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const xMean = average(xs);
  const yMean = average(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (values[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

function generateComment({ cityName, yoy, rankPct, txPerYear, forecastDirection }) {
  const trendPhrase = yoy > 0 ? `前年より${yoy}%上昇` : yoy < 0 ? `前年より${Math.abs(yoy)}%下落` : '前年とほぼ横ばい';
  const volumePhrase = txPerYear >= 15 ? '取引が活発' : txPerYear >= 6 ? '取引はやや落ち着いた水準' : '取引件数が少なくデータの変動が大きい';
  const rankPhrase = rankPct <= 25 ? 'エリア内でも上位クラスの価格帯' : rankPct <= 60 ? 'エリア内では標準的な価格帯' : 'エリア内では控えめな価格帯';
  const forecastPhrase =
    forecastDirection > 0 ? '緩やかな上昇基調が続く見込み' : forecastDirection < 0 ? '緩やかな下落基調が続く見込み' : '横ばい傾向が続く見込み';

  return `${cityName}の戸建て取引価格は${trendPhrase}しています(${volumePhrase})。本物件は${rankPhrase}で、直近の実績トレンドを単純延長すると今後は${forecastPhrase}です。`;
}

/**
 * 対象物件(住所+建物属性)と、その市区町村の戸建て取引実績データから
 * 資産価値レポートに必要な指標一式を計算する。
 */
export function computeReport({ rawTrades, subject, cityName }) {
  const comps = normalizeTrades(rawTrades);
  if (comps.length < 5) {
    throw new InsufficientDataError(
      `${cityName}の戸建て取引データが不足しているため、資産価値の算出ができませんでした。`
    );
  }

  const buckets = getHalfYearBuckets();

  const bucketedComps = buckets.map((b) => comps.filter((c) => inBucket(c.period, b)));
  let bucketAvgUnitPrice = bucketedComps.map((list) => average(list.map((c) => c.pricePerSqm)));
  // 欠測バケットは前後の値で補間して折れ線を連続させる(取引が少ない四半期があるため)
  fillGaps(bucketAvgUnitPrice);

  const recentComps = comps.filter((c) => isWithinLastNQuarters(c.period, buckets, RECENT_QUARTERS));
  const prevYearComps = comps.filter((c) => isWithinLastNQuarters(c.period, buckets, RECENT_QUARTERS * 2)).filter(
    (c) => !isWithinLastNQuarters(c.period, buckets, RECENT_QUARTERS)
  );
  const effectiveRecentComps = recentComps.length >= 3 ? recentComps : comps.slice(-15);

  const landUnitPrice = median(effectiveRecentComps.map((c) => c.pricePerSqm));

  const compAges = effectiveRecentComps
    .map((c) => (c.builtYear ? c.period.year - c.builtYear : null))
    .filter((a) => Number.isFinite(a) && a >= 0 && a <= 100);
  const avgCompAge = compAges.length ? average(compAges) : subject.age;
  const ageAdjustment = clamp(1 - (subject.age - avgCompAge) * AGE_ADJUSTMENT_PER_YEAR, 0.6, 1.25);

  const estimatedValue = Math.round((landUnitPrice * subject.landArea * ageAdjustment) / 100000) * 100000;

  const variability = clamp(stddev(effectiveRecentComps.map((c) => c.pricePerSqm)) / landUnitPrice, 0.05, 0.15);
  const rangeLow = Math.round((estimatedValue * (1 - variability)) / 100000) * 100000;
  const rangeHigh = Math.round((estimatedValue * (1 + variability)) / 100000) * 100000;
  const unitPrice = Math.round(((estimatedValue / subject.landArea) / 10000) * 10) / 10;

  const latestUnit = bucketAvgUnitPrice[bucketAvgUnitPrice.length - 1];
  const yearAgoUnit = bucketAvgUnitPrice[bucketAvgUnitPrice.length - 3];
  const yoy = yearAgoUnit ? Math.round(((latestUnit - yearAgoUnit) / yearAgoUnit) * 1000) / 10 : 0;

  const scale = estimatedValue / latestUnit;
  const trend = bucketAvgUnitPrice.map((v) => Math.round((v * scale) / 10000));

  const { slope, intercept } = linearRegression(trend);
  const forecast = [trend.length, trend.length + 1].map((x) => Math.max(0, Math.round(slope * x + intercept)));
  const forecastDirection = Math.sign(slope);

  const nearbyAvg = Math.round(average(effectiveRecentComps.map((c) => c.tradePrice)));
  const bucketAvgTradePrice = bucketedComps.map((list) => average(list.map((c) => c.tradePrice)));
  fillGaps(bucketAvgTradePrice);
  const latestTrade = bucketAvgTradePrice[bucketAvgTradePrice.length - 1];
  const yearAgoTrade = bucketAvgTradePrice[bucketAvgTradePrice.length - 3];
  const nearbyYoy = yearAgoTrade ? Math.round(((latestTrade - yearAgoTrade) / yearAgoTrade) * 1000) / 10 : 0;

  const sortedByPrice = [...comps].sort((a, b) => b.tradePrice - a.tradePrice);
  const rankTotal = sortedByPrice.length;
  const rankPos = sortedByPrice.filter((c) => c.tradePrice >= estimatedValue).length + 1;
  const rankPct = Math.max(1, Math.round((rankPos / rankTotal) * 100));

  const txPerYear = recentComps.length;
  const txPerYearPrev = prevYearComps.length;
  const avgDays = clamp(Math.round(3650 / Math.max(txPerYear, 1)), 20, 200);
  const avgDaysPrev = clamp(Math.round(3650 / Math.max(txPerYearPrev, 1)), 20, 200);
  const avgDaysYoy = avgDays - avgDaysPrev;
  const sellWindow = txPerYear >= 15 ? '今後3ヶ月以内' : txPerYear >= 6 ? '今後6ヶ月以内' : '今後12ヶ月以内';

  const ai = generateComment({ cityName, yoy, rankPct, txPerYear, forecastDirection });

  return {
    value: estimatedValue,
    yoy,
    rangeLow,
    rangeHigh,
    unitPrice,
    trend,
    forecast,
    nearbyAvg,
    nearbyYoy,
    rankPct,
    rankTotal,
    rankPos,
    avgDays,
    avgDaysYoy,
    sellWindow,
    ai,
    buckets,
    comps,
    recentComps: effectiveRecentComps,
    methodology: {
      landUnitPrice: Math.round(landUnitPrice),
      avgCompAge: Math.round(avgCompAge),
      ageAdjustment: Math.round(ageAdjustment * 100) / 100,
      compCount: comps.length,
      recentCompCount: effectiveRecentComps.length,
    },
  };
}

function fillGaps(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) {
      const prev = [...arr.slice(0, i)].reverse().find((v) => v != null);
      const next = arr.slice(i + 1).find((v) => v != null);
      arr[i] = prev != null && next != null ? (prev + next) / 2 : prev ?? next ?? 0;
    }
  }
}
