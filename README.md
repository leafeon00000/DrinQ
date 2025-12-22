# setup

AWS CLIをダウンロードする
https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html

## AWS 設定
AWS configure


## デプロイ方法
cd infra
npm ci

### STGデプロイ
npm run deploy:stg -- --all

### STG破壊（全部消える）
npm run destroy:stg

### PRODデプロイ
npm run deploy:prod

### PROD破壊（※RETAIN付きは残る）
npm run destroy:prod
