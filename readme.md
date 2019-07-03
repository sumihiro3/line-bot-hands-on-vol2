# ハンズオン準備

## ディレクトリ作成＆ソースコード クローン

クローン先のディレクトリは任意です

### Max/Linux

```bash
$ mkdir ~/ldgk-hands-on && cd ~/ldgk-hands-on
$ git clone https://github.com/sumihiro3/line-bot-hands-on-vol2.git
$ cd line-bot-hands-on-vol1
```

### Windows

```bat
> mkdir c:¥tmp¥ldgk-hands-on
> cd c:¥tmp¥ldgk-hands-on
> git clone https://github.com/sumihiro3/line-bot-hands-on-vol2.git
> cd line-bot-hands-on-vol1
```

## プログラムに必要なモジュールをインストール

```bash
$ npm install
```

# 第1部 はじめてのLIFF

## ngrok インストール＆起動

```bash
$ npm install -g ngrok

$ ngrok http 3000
```

## LIFF アプリを設定する

### LIFFアプリを追加する

#### エンドポイントURL

```text
https://{ngrok のホスト名}.ngrok.io/liff/first_liff.html
```

### 環境変数を設定

.env ファイルを編集

```text
CHANNEL_ACCESS_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
CHANNEL_SECRET="XXXXXXXXXXXX"
BASE_URL="https://XXXXXX.ngrok.io"
```

## プログラムの起動

```bash
$ node app.js
```

# 第2部 クイズBot のLIFF 化

## リッチメニューの設定

### 下記資料を参照

http://bit.ly/ldgk-bot-hands-on-vol1

## プログラムの起動

```bash
$ node app.js
```

## FlexMessage を使ったメッセージを送ってみよう

### 全問回答後のメッセージをFlexMessage 化する

```javascript:app.js 172 行目付近
// 前略
} else if (postback_type === POSTBACK_TYPE_SHOW_QUIZ_RESULT) {
        // クイズの結果を見る
        const quiz_result = quiz.getQuizeResultFor(user_id);
        let message = {};
        if (quiz_result != null) {
            // TODO クイズの結果をFlexMessage で返す
            message = {'type': 'text', 'text': quiz_result['message']};
        } else {
            // 回答が終わっていなかった場合
            message = generateInvalidOperationMessage();
        }
        return client.replyMessage(replyToken, message);
} else {
// 後略
```

# 関連リンク

## ハンズオン関係

* [サンプルプログラム](https://github.com/sumihiro3/line-bot-hands-on-vol1)
* [資料置き場](http://bit.ly/ldgk-bot-hands-on-vol1)

## LINE 関係

### LINE 開発者向けサイト (LINE Developers)

* [LINE Developers Top page](https://developers.line.biz/ja/)
* [Messaging API Top](https://developers.line.biz/ja/services/messaging-api/)
* [Messaging API Document](https://developers.line.biz/ja/docs/messaging-api/)
* [FlexMessage Simulator](https://developers.line.biz/console/fx/)
* [Messaging API SDK](https://developers.line.biz/ja/docs/messaging-api/line-bot-sdk/)

### LINE 公式アカウント

* [LINE 公式アカウントマネージャー](https://manager.line.biz/)

## LINE Developer Group Kansai

* [Facebook page](https://www.facebook.com/groups/LINEDeveloperGroupKansai/)
* [Connpass page](https://ldgk.connpass.com/)
