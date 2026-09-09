# 不動産資産価値レポートアプリ

戸建て(東京都・神奈川県・埼玉県・千葉県)の資産価値を、国土交通省「不動産情報ライブラリ」の公開データをもとに
参考推定値として表示するWebアプリです。

- `client/` — React (Vite) 製フロントエンド。デザインは `property-value-prototype.jsx` を踏襲しています。
- `server/` — Node.js (Express) 製APIサーバー。国交省 不動産情報ライブラリAPI と Google Geocoding API を
  サーバー側から呼び出し、査定値・推移・将来予測・相場マップ用データを計算してフロントエンドに返します。

## 使用しているAPI

| API | 用途 | キーの置き場所 |
| --- | --- | --- |
| 国交省 不動産情報ライブラリAPI (XIT001/XIT002) | 戸建ての取引価格データ取得 | `server/.env` の `REINFOLIB_API_KEY`(サーバー専用・非公開) |
| Google Geocoding API | 住所→緯度経度・市区町村の解決 | `server/.env` の `GOOGLE_MAPS_SERVER_API_KEY`(サーバー専用・非公開) |
| Google Maps JavaScript API | 相場マップタブの地図表示 | `client/.env` の `VITE_GOOGLE_MAPS_BROWSER_API_KEY`(ブラウザに公開されるため、HTTPリファラー制限を必ず設定) |

サーバー用とブラウザ用でGoogle APIキーを分けているのは、Googleが推奨するベストプラクティス(サーバー鍵はIP制限、ブラウザ鍵はリファラー制限)に沿ったものです。

## セットアップ

### 1. APIキーの取得

- 不動産情報ライブラリAPI: https://www.reinfolib.mlit.go.jp/api/request/ から無料登録(審査に数営業日)
- Google Maps: Google Cloud Consoleで「Geocoding API」と「Maps JavaScript API」を有効化し、それぞれ制限をかけたキーを発行

### 2. サーバー

```bash
cd server
cp .env.example .env   # REINFOLIB_API_KEY / GOOGLE_MAPS_SERVER_API_KEY を設定
npm install
npm run dev             # http://localhost:8787
```

### 3. クライアント

```bash
cd client
cp .env.example .env   # VITE_GOOGLE_MAPS_BROWSER_API_KEY を設定
npm install
npm run dev              # http://localhost:5173 (vite.config.js の proxy で /api を server へ転送)
```

### 本番ビルド(単一プロセスで動かす場合)

```bash
cd client && npm run build
cd ../server && npm start   # dist が存在すれば server が静的配信も兼ねる
```

## 資産価値の算出ロジック(概要)

不動産情報ライブラリAPIの取引価格情報(XIT001)は、匿名化された「町丁目単位・四半期単位」の取引実績のみを提供し、
個々の物件の緯度経度や実勢相場そのものは含まれません。そのため本アプリでは以下の簡易ロジックで参考推定値を算出しています。

1. 住所をGeocodingで都道府県・市区町村に変換し、該当エリアの直近4年分の「宅地(土地と建物)」取引データを取得
2. 直近1年の取引の土地1㎡あたり価格(取引総額 ÷ 土地面積)の中央値を基準単価とする
3. 入力された築年数と、比較対象データの平均築年数との差から簡易な価格調整(1年あたり±1%)を行う
4. 基準単価 × 入力された土地面積 × 築年数調整 = 推定資産価値
5. 直近3年分を半期ごとに集計した単価の推移を、推定資産価値に合わせてスケーリングしグラフ化
6. 推移データを最小二乗法で単純延長し、将来2期分の予測値とする
7. 「成約平均日数」は取引価格APIに含まれないため、直近の取引件数から算出した目安値として表示(画面上にも注記)
8. 相場マップのピンは、取引価格APIが座標を持たないため、町丁目名をGeocodingした近似地点に表示

これらの前提はすべて概算であり、不動産鑑定士による正式な鑑定評価ではありません。画面下部の免責事項もあわせてご確認ください。

## 既知の制約

- ネットワーク制約のある開発環境で作業したため、不動産情報ライブラリAPIのレスポンス仕様は公式マニュアルの直接参照ではなく、
  公開されている実装例・記事の情報をもとに実装しています。API仕様が変更されている場合は
  `server/lib/reinfolibClient.js` / `server/lib/valuation.js` のフィールド名を最新の
  [API操作説明](https://www.reinfolib.mlit.go.jp/help/apiManual/) と突き合わせて調整してください。
- 実際のAPIキーでの疎通確認は行っていません。キー設定後、まずは `server` の `/api/health` で
  `reinfolibConfigured` / `googleMapsConfigured` が `true` になることを確認し、続けて
  `GET /api/property/valuate?address=東京都世田谷区代田` 等で動作確認してください。
