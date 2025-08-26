# CertPath 📚

> IT資格学習を支援する次世代プラットフォーム

[![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.4-6E9F18?logo=vitest)](https://vitest.dev/)

## 🚀 概要

CertPathは、IT資格の学習を効率化し、学習者同士のコミュニティを形成する学習支援プラットフォームです。
進捗管理、タスク管理、コミュニティ機能を統合し、個人の学習体験を向上させます。

### ✨ 主な機能

- **📊 学習進捗管理**: プロジェクトベースの学習計画と進捗可視化
- **✅ タスク管理システム**: 細分化されたタスクによる効率的な学習
- **👥 コミュニティ機能**: 学習者同士の交流・モチベーション向上
- **📄 プロジェクト共有**: 公開プロジェクトの閲覧・コピー機能
- **❤️ いいね機能**: コミュニティ内での相互フィードバック
- **🔐 認証システム**: Google OAuth連携による安全なログイン

## 🛠️ 技術スタック

### フロントエンド
- **React 19** + **TypeScript** + **Next.js 15**
- **Tailwind CSS** - モダンなスタイリング
- リアルタイム更新対応
- レスポンシブデザイン

### バックエンド
- **Supabase**
  - PostgreSQL データベース
  - リアルタイム機能
  - 認証システム（Google OAuth）
  - Row Level Security (RLS)

### 開発・テスト
- **Vitest** + **Testing Library** - テストフレームワーク
- **ESLint** - コード品質管理
- **TypeScript** - 型安全性

### デプロイメント
- **Railway** - CI/CD自動デプロイ

## 🗂️ プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ  
│   ├── certifications/    # 資格一覧・詳細
│   ├── community/         # コミュニティページ
│   ├── projects/          # プロジェクト管理
│   └── profile/           # ユーザープロフィール
├── components/            # 再利用可能なコンポーネント
├── hooks/                 # カスタムフック
│   ├── useAuth.ts        # 認証管理
│   ├── useProjects.ts    # プロジェクト操作
│   ├── useTasks.ts       # タスク操作
│   └── useActivities.ts  # 活動・いいね機能
├── lib/                  # ユーティリティ
└── types/                # TypeScript型定義

docs/
├── station2/             # 要件定義
├── station3/             # 基本設計（UI/UX、DB設計）
└── station4/             # 詳細設計（API、エラー処理）
```

## 🚀 クイックスタート

### 前提条件
- Node.js 18以上
- npm または yarn
- Supabase アカウント

### インストール・セットアップ

> **注意**: 現在は開発環境での動作確認用の手順です。本番環境への公開版は準備中です。

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-username/certpath.git
cd certpath
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env.local
```

`.env.local`に以下を設定（開発用のSupabaseプロジェクトが必要）:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **開発サーバーの起動**
```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

> **公開版について**: 近日中にRailwayにデプロイして一般公開予定です。公開後は上記のセットアップ不要で直接アクセス可能になります。

### 🧪 テスト実行

```bash
# テスト実行
npm run test

# ウォッチモード
npm run test:watch

# テストUI
npm run test:ui

# カバレッジ
npm run test:coverage
```

### 🔧 その他のコマンド

```bash
# 型チェック
npm run type-check

# リント
npm run lint

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start
```

## 🗄️ データベース設計

主要テーブル:
- `users` - ユーザー情報
- `certifications` - 資格情報
- `projects` - 学習プロジェクト
- `tasks` - プロジェクト内タスク
- `activities` - コミュニティ活動
- `likes` - いいね機能

詳細な設計は [docs/station3/Table.csv](docs/station3/Table.csv) を参照してください。

## 📖 API仕様

RESTful API設計に基づいた仕様書:
- [OpenAPI仕様書](docs/station4/api.yaml)
- JWT Bearer認証
- 包括的なエラーハンドリング

## 💻 開発情報

### コーディング規約
- **TypeScript**: strict モード
- **命名**: camelCase (フロントエンド), snake_case (データベース)
- **コンポーネント**: 機能単位で分割・再利用可能な設計
- **テスト**: 重要な機能にはVitest + Testing Libraryでテストを実装

## 🎯 主要機能の詳細

### プロジェクト管理
- 資格ごとの学習プロジェクト作成
- タスクの作成・編集・完了管理
- 進捗率の自動計算・可視化

### コミュニティ機能
- 学習活動の投稿・共有
- いいね機能による相互サポート
- リアルタイム更新

### プロジェクト共有
- 公開プロジェクトの一覧表示
- 他ユーザーのプロジェクトコピー機能
- タスク一括コピー

## 📈 今後の拡張予定

- [ ] 学習統計・分析機能
- [ ] コメント・フィードバック機能
- [ ] 学習リマインダー機能
- [ ] モバイルアプリ対応
- [ ] 多言語対応

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👤 作成者

**hiroki90g**

- GitHub: [@hiroki90g](https://github.com/hiroki90g)

## 🙏 謝辞

このプロジェクトは TechTrain の「プロダクト開発 実践編」として開発されました。
学習の機会を提供していただいた関係者の皆様に感謝いたします。

---

⭐ このプロジェクトが役に立った場合は、スターをつけていただけると励みになります！