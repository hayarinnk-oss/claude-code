// 対象は 1都3県(東京都・神奈川県・埼玉県・千葉県) のみ。
// コードは JIS X 0401 の都道府県コードで、国交省 不動産情報ライブラリAPI の `area` パラメータと一致する。
export const SUPPORTED_PREFECTURES = {
  東京都: '13',
  神奈川県: '14',
  埼玉県: '11',
  千葉県: '12',
};

export function prefCodeFromName(prefName) {
  if (!prefName) return null;
  const hit = Object.entries(SUPPORTED_PREFECTURES).find(([name]) => prefName.includes(name));
  return hit ? hit[1] : null;
}

export function isSupportedPrefecture(prefName) {
  return prefCodeFromName(prefName) != null;
}
