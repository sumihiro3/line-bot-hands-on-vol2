# ハンズオン準備

## ハンズオン資料

### 今回の資料

http://bit.ly/ldgk-bot-hands-on-vol2

TODO: 資料掲載＆短縮URL取得

### （前回）LINE Bot 開発 基本編

http://bit.ly/ldgk-bot-hands-on-vol1

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

#### 名前

```text
MyFirstLIFF
```

#### エンドポイントURL

```text
https://{ngrok のサブドメイン}.ngrok.io/liff/first_liff.html
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

## LIFFアプリを追加する

### 名前

```text
Quiz LIFF
```

### エンドポイントURL

```text
https://{ngrok のサブドメイン}.ngrok.io/liff/quiz_liff.html
```

## プログラムの起動

```bash
$ node quiz_api.js
```

# 関連リンク

## ハンズオン関係

* [サンプルプログラム](https://github.com/sumihiro3/line-bot-hands-on-vol2)
* [資料置き場](http://bit.ly/ldgk-bot-hands-on-vol2)

## LINE 関係

### LINE 開発者向けサイト (LINE Developers)

* [LINE Developers Top page](https://developers.line.biz/ja/)
* [Messaging API Top](https://developers.line.biz/ja/services/messaging-api/)
* [Messaging API Document](https://developers.line.biz/ja/docs/messaging-api/)
* [FlexMessage Simulator](https://developers.line.biz/console/fx/)
* [Messaging API SDK](https://developers.line.biz/ja/docs/messaging-api/line-bot-sdk/)
* [LINE Front-end Framework](https://developers.line.biz/ja/docs/liff/)

### LINE 公式アカウント

* [LINE 公式アカウントマネージャー](https://manager.line.biz/)

### Vue.js 関係

* [Vue.js](https://jp.vuejs.org/index.html)
* [Vuetify](https://vuetifyjs.com/ja/)
* [axios](https://github.com/axios/axios)

## LINE Developer Group Kansai

* [Facebook page](https://www.facebook.com/groups/LINEDeveloperGroupKansai/)
* [Connpass page](https://ldgk.connpass.com/)
