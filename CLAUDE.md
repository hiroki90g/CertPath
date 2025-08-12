# CertPath - IT 資格学習支援プラットフォーム

## プロジェクト概要
CertPathは、IT資格の学習を支援するWebアプリケーションです。コミュニティ機能でのリアルタイム更新、進捗共有、学習管理機能を提供します。

## 技術スタック

### フロントエンド
- **React + TypeScript + Next.js**
  - コミュニティ機能でのリアルタイム更新対応
  - useState による状態管理
  - コンポーネントの再利用（ナビゲーションバー、タスクカード等）
  - 1ヶ月の短期開発のため習得済み技術を使用

### バックエンド
- **Supabase**
  - PostgreSQL データベース（ACID準拠、強整合性）
  - Supabase Auth（Googleアカウント連携）
  - リアルタイム機能（コミュニティ活動の即座反映）
  - Row Level Security (RLS) によるセキュリティ

### デプロイメント
- **Railway**
  - フルスタックアプリに最適
  - GitHubからの自動デプロイ
  - CI/CDパイプライン
  - インフラ管理不要
  - 短期間の個人開発に適したシンプル設定

## データベース設計
PostgreSQLテーブル設計：
- ユーザー情報（users）
- 学習進捗（progress）
- コミュニティ投稿（posts）
- 資格情報（certifications）

詳細は `docs/station3/Table.csv` 参照

## API仕様
OpenAPI 3.0.3 仕様書：`docs/station4/api.yaml`
- JWT Bearer認証
- RESTful API設計
- エラーハンドリング

## エラー処理
包括的な例外処理設計：
- 認証エラー（AUTH001-003）
- データベース関連（DATA001-003） 
- バリデーション（VALID001-004）
- ネットワーク（NETWORK001-002）
- システムエラー（SYSTEM001-002）

詳細は `docs/station4/exception_specifications.csv` 参照

## バリデーション
フォームバリデーション設計：
- 必須項目チェック
- 文字数制限
- 形式チェック（メール、URL等）
- 重複チェック

詳細は `docs/station4/validation_design.csv` 参照

## プロジェクト構成

### ドキュメント構造
```
docs/
├── station2/doc-v2.md           # 要件定義（Supabase版）
├── station3/
│   ├── doc.md                   # 技術選定理由
│   ├── Design_Document_1.md     # 設計書1（技術選定・UI・フロー）
│   ├── UI_Design.pdf           # 画面設計図
│   ├── Screen_State.drawio.png # 画面遷移図
│   ├── User_Flow.drawio.png    # ユーザーフロー図
│   ├── ER.drawio.png           # ER図
│   └── Table.csv               # テーブル定義書
├── station4/
│   ├── doc.md                  # 詳細設計書
│   ├── Design_Document_2.md    # 設計書2（例外・API・テスト）
│   ├── fb.md                   # レビュー結果
│   ├── exception_specifications.csv # 例外仕様
│   ├── openapi.yaml            # OpenAPI仕様書
│   └── validation_design.csv   # バリデーション設計
```

## コーディング規約
- snake_case: データベースフィールド名
- camelCase: フロントエンドJavaScript/TypeScript
- PostgreSQL標準データ型使用（uuid, text, timestamptz等）
- セキュリティベストプラクティス遵守

## 開発・運用
- 開発期間：1ヶ月
- テスト：自動テスト設計書あり
- WBS：作業分解とガントチャートで進捗管理
- CI/CD：Railway自動デプロイ

## 設計方針
- リアルタイム性を重視
- セキュリティファースト（RLS、JWT認証）
- 拡張性を考慮したコンポーネント設計
- 短期開発のための技術選定
- 運用保守の簡素化

## ブランチの扱い
main -> dev -> dev-init -> ここから topic-branch を切る、基本的にdev-init にマージ