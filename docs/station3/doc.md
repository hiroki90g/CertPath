# 各設計書
## 1. 技術選定理由

- フロントエンド: React
  - コミュニティ機能でリアルタイム更新が必要
    - useState で状態管理とリアルタイムデータ更新を実現
  - コンポーネントの再利用
    - コンポーネント設計により、ナビゲーションバーやタスクカードなど、UI 部品の再利用を実現
  - 開発効率
    - 1ヶ月を目標にするため、習得済みの技術を使用
- バックエンド: Supabase (PostgreSQL, Authentication, Storage)
  - リアルタイム機能
    - PostgreSQLのリアルタイム機能によりコミュニティ活動の即座な反映、進捗共有
  - 認証システム
    - Supabase AuthによるGoogleアカウントでの簡単ログイン
  - 開発速度
    - 一ヶ月の短期開発のため、サーバー構築の負担を軽減。フロントエンドの開発に集中
  - データベースの信頼性
    - PostgreSQLによるACID準拠のトランザクション、強整合性
- デプロイ: Railway
  - フルスタックアプリに最適
    - フロントエンドとSupabaseを統合したアプリケーションに適している
  - 簡単なデプロイ
    - GitHubからの自動デプロイとCI/CDパイプライン
  - インフラ管理不要
    - サーバー管理やスケーリングを自動化
  - 運用効率
    - 短期間の個人開発に適したシンプルな設定と料金体系


## 2. 画面設計図
https://www.figma.com/design/ypDQ6Do1ULirKjdd7H4XlM/CertPath---%E7%94%BB%E9%9D%A2%E8%A8%AD%E8%A8%88%E5%9B%B3?node-id=0-1&p=f&t=DoggkUK488z8wGIH-0

## 3. 画面遷移図
https://app.diagrams.net/?splash=0#G1KeyfSBaBjgrzZVWyUJBxkkxAPsMEnCmH#%7B%22pageId%22%3A%22B3SdsUP3fVvnTOR9Cq7t%22%7D

## 4. ユーザーフロー図
https://app.diagrams.net/?libs=general;flowchart#G1rjE7D1RYuYwux4Kf7qyqK_A4rItZWKjq#%7B%22pageId%22%3A%22C5RBs43oDa-KdzZeNtuy%22%7D

## 5. ER 図
https://drive.google.com/file/d/1_DLjQ4gUMpe34P0cDDE052CE-XtC84kc/view?usp=sharing

## 6. API 仕様書
下記に記載
docs/station3/api_specification.md
→Station04で更新し、yamlファイルに記載

## 7. テーブル定義書
https://docs.google.com/spreadsheets/d/1KPBC4NWkiCfJaCj6PxlhbdcIwjb-WlHhjKYOwADml0I/edit?gid=733441193#gid=733441193