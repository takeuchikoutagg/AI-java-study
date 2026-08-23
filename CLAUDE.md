# CLAUDE.md

このファイルはこのリポジトリで作業する際のガイドラインです。

## プロジェクト概要

Trelloを参考にした個人用タスク管理アプリ。技術スタックはReact（Vite）+ Spring Boot（Java）。詳細は [README.md](./README.md) および [要件定義.md](./要件定義.md) を参照。

## 起動コマンド

起動方法の詳細は [README.md](./README.md#起動方法) を参照。

- バックエンド: `cd backend && ./start.sh`
- フロントエンド: `cd frontend && ./start.sh`

いずれもポート競合時（8080/5173が使用中）は既存プロセスを自動停止してから起動する。

## 開発ルール

### ブランチ運用

- **mainブランチに直接変更を加えない。** 作業は必ずissueごとに作業用ブランチを作成して行う。
- ブランチはissueに対応する形で作成する（例: `issue-12`、`feature/12-task-edit` など、issue番号がわかる命名にする）。
- 作業が完了したら、mainブランチへはPull Requestを経由してマージする。
