# AI-java-study

Trelloを参考にした、個人用のシンプルなタスク管理アプリ。オンラインスクールの課題として開発。

## 概要

- 対象ユーザー: 開発者本人（個人利用のみ、複数人共有・アカウント機能なし）
- 技術スタック: React（Vite）+ Spring Boot（Java 25）
- データ保存先: バックエンド（Spring Boot）経由でPostgreSQL（Docker Compose）に永続化。バックエンド・フロントエンドを再起動してもデータは保持される
- 実装状況: バックエンドのタスク読み取りAPIと、それをボード画面として表示するフロントエンドまでが実装済み。カードの追加・編集・削除やドラッグ&ドロップでの並べ替えは今後対応予定（詳細は [docs/実装計画.md](./docs/実装計画.md) を参照）

## 主な機能（実装予定を含む）

- ボード・リストの管理（単一ボード、リストの自由な追加・削除）
- カードの追加・編集・削除
- カードのリスト間移動、ドラッグ&ドロップによる並べ替え
- カードへの期限設定・優先度設定（色分け表示）
- リスト内カードの優先度順一括並べ替え

詳細な仕様は [docs/機能要件.md](./docs/機能要件.md) を参照。

## 技術スタック

| 分類 | 技術 | バージョン |
|---|---|---|
| フロントエンド | React + Vite | React 19.2.8 / Vite 8.2.1 |
| バックエンド | Spring Boot（Java） | Spring Boot 4.1.0 / Java 25 |
| データベース | PostgreSQL（Docker） | PostgreSQL 17 |

バージョンを含む詳細は [docs/技術スタック.md](./docs/技術スタック.md) を参照。

## ディレクトリ構成

```
frontend/   … React + Vite製フロントエンド（現行）
backend/    … Spring Boot（Gradle）製バックエンド（現行）
docs/       … 要件定義の詳細ドキュメント
.claude/    … Claude Code向けの設定・プロジェクトスキル
index.html / script.js / style.css
            … 素のHTML/CSS/JSで作った初期プロトタイプ（現行のReact+Spring Boot版に移行する前のもの。参考用に残置）
```

## セットアップ・起動方法

前提: Docker、Node.js、Java（`backend/`のGradle Toolchain設定によりローカルにJava 25が無くても自動取得される）

1. PostgreSQLを起動: `docker compose up -d`
2. バックエンドを起動: `backend/start.sh`（ポート8080が使用中の場合は既存プロセスを停止してから `./gradlew bootRun` を起動）
3. フロントエンドを起動: `frontend/start.sh`（ポート5173が使用中の場合は既存プロセスを停止してから `npm run dev` を起動）
4. ブラウザで `http://localhost:5173` を開く

いずれのサーバーも、ポートが競合している場合は既存プロセスを停止したうえで必ず指定ポート（8080 / 5173）で起動する（別ポートへは逃がさない）。詳細は [.claude/skills/start-dev-servers/SKILL.md](./.claude/skills/start-dev-servers/SKILL.md) を参照。

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義.md](./要件定義.md) | 概要・対象ユーザー・利用環境・制約条件・実装状況まとめ |
| [docs/機能要件.md](./docs/機能要件.md) | ボード・リスト・カードの機能仕様 |
| [docs/画面一覧.md](./docs/画面一覧.md) | 画面・モーダルの構成 |
| [docs/ユースケース.md](./docs/ユースケース.md) | ユースケース一覧（UC1〜UC11） |
| [docs/ER図.md](./docs/ER図.md) | BOARD・LIST・CARDのER図 |
| [docs/技術スタック.md](./docs/技術スタック.md) | 使用技術・バージョン・ディレクトリ構成 |
| [docs/実装計画.md](./docs/実装計画.md) | 週ごとの実装計画・進捗状況 |

## 開発ルール

ブランチ運用（issueごとの作業ブランチ・PR経由でのマージ）などの開発ルールは [CLAUDE.md](./CLAUDE.md) を参照。
