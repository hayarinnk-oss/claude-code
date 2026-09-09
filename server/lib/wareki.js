// 和暦(令和/平成/昭和)混じりの年表記を西暦の数値に変換する
const ERA_START_YEAR = { 令和: 2018, 平成: 1988, 昭和: 1925 };

export function toSeireki(text) {
  if (!text) return null;
  const seireki = text.match(/(\d{4})年/);
  if (seireki) return Number(seireki[1]);

  const wareki = text.match(/(令和|平成|昭和)(\d{1,2}|元)年/);
  if (wareki) {
    const [, era, numRaw] = wareki;
    const num = numRaw === '元' ? 1 : Number(numRaw);
    return ERA_START_YEAR[era] + num;
  }
  return null;
}

export function parsePeriod(periodText) {
  // 例: "2023年第4四半期"
  if (!periodText) return null;
  const m = periodText.match(/(\d{4})年第(\d)四半期/);
  if (!m) return null;
  return { year: Number(m[1]), quarter: Number(m[2]) };
}
