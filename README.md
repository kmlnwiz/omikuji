# 新春おみくじ

和風デザインのおみくじ Web アプリケーションです。30 枚のカードから 1 枚を選び、内容を確認できます。

## 機能

- 30 枚のカードから選択しておみくじを引く
- カードめくりアニメーション
- レアリティに応じた演出エフェクト（大吉が最も豪華）
- 履歴機能で過去の結果を再確認可能
- 全画面表示対応
- FHD（1920×1080）に最適化

## レアリティの種類

| 運勢 | 枚数  | 演出                                   |
| ---- | ----- | -------------------------------------- |
| 大吉 | 1 枚  | 金色の光、紙吹雪、キラキラパーティクル |
| 中吉 | 4 枚  | オレンジ色の光、キラキラ               |
| 吉   | 10 枚 | 緑色の穏やかな光                       |
| 小吉 | 15 枚 | 青色の控えめな光                       |

## 使い方

1. 30 枚のカードから好きな 1 枚を選んでクリック
2. カードがめくれて内容が表示されます
3. 結果画面をクリックして閉じると次のカードを選べます
4. 「これまでの結果」から過去の結果を再確認できます

## ファイル構成

```
omikuji/
├── index.html          # メインHTML
├── omikuji.js          # メインアプリケーション
├── omikuji-data.json   # おみくじデータ（レアリティ・メッセージ）
├── README.md           # このファイル
└── modules/
    ├── utils.js        # ユーティリティ（漢数字変換など）
    ├── data-loader.js  # データ読み込み
    ├── card-generator.js # カード生成
    ├── card-renderer.js  # カードUI描画
    ├── effects.js      # 演出エフェクト
    ├── history.js      # 履歴管理
    └── stats.js        # 統計表示
```

## カスタマイズ

### おみくじデータの編集

`omikuji-data.json` を編集することで、レアリティの種類や枚数、メッセージをカスタマイズできます。

```json
{
  "totalCards": 30,
  "ranks": [
    {
      "rank": 1,
      "type": "daikichi",
      "label": "大吉",
      "ratio": 1,
      "bgColor": "#fff0f0",
      "borderColor": "#c83c3c",
      "sealColor": "#c83c3c",
      "textColor": "#8b0000"
    }
  ],
  "messages": {
    "daikichi": ["メッセージ1", "メッセージ2"]
  }
}
```

- `totalCards`: カードの総枚数
- `ratio`: 各レアリティの出現比率（合計に対する割合で枚数が決定）
- `messages`: 各レアリティに対応するメッセージ（ランダムに選択）

## 動作環境

- モダンブラウザ（Chrome, Firefox, Safari, Edge）
- ES Modules 対応ブラウザ
- ローカルサーバー経由での実行を推奨（`file://` プロトコルでは CORS エラーの可能性あり）

### ローカルでの実行方法

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve

# VS Code Live Server拡張機能
# index.htmlを右クリック → "Open with Live Server"
```

## ライセンス

MIT License
