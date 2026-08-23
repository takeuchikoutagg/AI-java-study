# AI-java-study

Trelloを参考にした、個人用のシンプルなタスク管理アプリ。オンラインスクールの課題として開発。

## 概要

- 対象ユーザー: 開発者本人（個人利用のみ、複数人共有・アカウント機能なし）
- 技術スタック: React（Vite）+ Spring Boot（Java 25）
- データ保存先: バックエンド（Spring Boot）のインメモリ（DBは一旦使用しない方針。アプリ再起動でデータは消える）

## ディレクトリ構成

```
frontend/   … React + Vite製フロントエンド（現行）
backend/    … Spring Boot（Gradle）製バックエンド（現行）
docs/       … 要件定義の詳細ドキュメント
index.html / script.js / style.css
            … 素のHTML/CSS/JSで作った初期プロトタイプ（現行のReact+Spring Boot版に移行する前のもの。参考用に残置）
```

## 起動方法

- バックエンド: `backend/start.sh`（ポート8080が使用中の場合は既存プロセスを停止してから `./gradlew bootRun` を起動）
- フロントエンド: `frontend/start.sh`（ポート5173が使用中の場合は既存プロセスを停止してから `npm run dev` を起動）

## ドキュメント

詳細な要件定義（画面一覧・ユースケース・ER図・非機能要件・技術スタックなど）は [要件定義.md](./要件定義.md) を参照。
