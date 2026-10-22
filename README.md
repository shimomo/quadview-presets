# QuadView Presets

[QuadView](https://github.com/shimomo/quadview)（YouTube の動画やライブを最大4枠で並べて見るツール）で読み込むプリセットです。
**非公式**のもので、掲載しているチャンネルの運営者とは関係ありません。

## 使い方

QuadView の「設定」→「プリセット」に、下の URL を足してください。いくつでも同時に足せます。
「API キーが必要」のプリセットは、QuadView の設定にあなた自身の YouTube API キーを入れると、今日の配信が出ます。

| プリセット | URL | 中身 |
|---|---|---|
| ニュース（国内） | `https://shimomo.github.io/quadview-presets/news-japan.json` | ANN・TBS・日テレの今日のニュースライブ（API キーが必要） |
| World news | `https://shimomo.github.io/quadview-presets/news-world.json` | Al Jazeera・DW News・FRANCE 24 の24時間ライブ |
| 天気・防災 | `https://shimomo.github.io/quadview-presets/weather.json` | ウェザーニュースの天気のライブと地震ライブ（API キーが必要） |
| 宇宙・自然 | `https://shimomo.github.io/quadview-presets/space-nature.json` | 国際宇宙ステーションからの地球、野生動物や海のライブカメラ |
| 作業用 BGM | `https://shimomo.github.io/quadview-presets/bgm.json` | lofi などの24時間音楽ライブ |
| 競輪 | `https://shimomo.github.io/quadview-presets/keirin.json` | 全43場の今日の中継（API キーが必要） |
| オートレース | `https://shimomo.github.io/quadview-presets/autorace.json` | 5場の今日の中継と、予想しながら見る裏配信（API キーが必要） |
| 地方競馬 | `https://shimomo.github.io/quadview-presets/nar.json` | 15場の今日の中継と、予想・解説の番組（API キーが必要） |
| ボートレース | `https://shimomo.github.io/quadview-presets/boatrace.json` | 24場の今日の中継と、女子戦の中継、演者つきの番組（API キーが必要） |
| 将棋・囲碁・麻雀 | `https://shimomo.github.io/quadview-presets/shogi-igo-mahjong.json` | 将棋のタイトル戦、囲碁、プロ麻雀団体の対局と Mリーグの今日の中継（API キーが必要） |
| 鉄道・ライブカメラ | `https://shimomo.github.io/quadview-presets/live-cameras.json` | 日本の駅・新幹線・渋谷・空港などの定点ライブカメラと、海外の鉄道ライブ |
| 経済・マーケット | `https://shimomo.github.io/quadview-presets/markets.json` | Bloomberg・Yahoo Finance・Schwab Network・CNBC-TV18 の24時間ライブと、日本語の決算解説 |

一覧は [`presets/index.json`](presets/index.json) にもあります。

## 中身について

- プリセットは、チャンネルや動画への**リンクの一覧**です。映像も、YouTube API から取ったデータも入っていません。
  チャンネルのプリセットは、チャンネル ID と、配信のタイトルを候補に振り分ける規則だけを持ち、配信は QuadView を使う人のブラウザが探します。
- 24時間ライブの動画は、配信が作り直されると映らなくなります。気づいたら直します（Issue も歓迎です）。
- チャンネルのプリセットは、タイトルで候補を決めるので、外れることがあります。たとえば、ふだん中継をしているチャンネルが、中継以外のライブ（番組など）を流すと、そのチャンネルの候補として出ることがあります。
- 掲載しているチャンネルの運営者から依頼があれば、該当するプリセットを削除します。

プリセットの形は、QuadView の README を見てください。`npm test` と `npm run validate` で、形を確かめられます。

## ライセンス

[MIT](LICENSE)
