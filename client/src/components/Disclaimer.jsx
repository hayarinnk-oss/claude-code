import { C } from '../theme.js';

export function Disclaimer() {
  return (
    <div style={{ margin: '8px 18px 0', paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
      <div style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.7 }}>
        本レポートは国土交通省「不動産情報ライブラリ」の公開データ(不動産取引価格情報)をもとに、簡易な計算ロジックで自動算出した参考推定値です。
        本サービスは不動産鑑定士による正式な鑑定ではありません。正式な価格評価については不動産鑑定士にご相談ください。
      </div>
    </div>
  );
}
