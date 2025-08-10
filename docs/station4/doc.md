# 設計2
ここにマークダウン形式のテキストやリンクを記載する。
※リンクの場合は、リンクを知っている全員が閲覧できるように権限設定してください。

# CertPath Station4 詳細設計書

## 1. 例外仕様書（例外パターンとその処理方法の定義）

### 1.1 認証系エラー

| エラーコード | エラー名 | 発生条件 | HTTPステータス | エラーメッセージ | 処理方法 |
|---|---|---|---|---|---|
| AUTH001 | 認証失敗 | Googleログインに失敗 | 401 | "ログインに失敗しました。再度お試しください。" | ログイン画面に戻る、エラートースト表示 |
| AUTH002 | セッション切れ | Firebaseトークンの有効期限切れ | 401 | "セッションが切れました。再度ログインしてください。" | 強制ログアウト、ログイン画面へリダイレクト |
| AUTH003 | 権限不足 | 他ユーザーのデータアクセス試行 | 403 | "アクセス権限がありません。" | エラーページ表示、前画面に戻るボタン |

### 1.2 データ系エラー

| エラーコード | エラー名 | 発生条件 | HTTPステータス | エラーメッセージ | 処理方法 |
|---|---|---|---|---|---|
| DATA001 | データ取得失敗 | Firestoreからのデータ取得エラー | 500 | "データの読み込みに失敗しました。しばらく待ってから再度お試しください。" | リトライボタン表示、3回まで自動リトライ |
| DATA002 | データ保存失敗 | Firestoreへのデータ保存エラー | 500 | "データの保存に失敗しました。入力内容を確認してください。" | フォーム内容保持、再送信ボタン表示 |
| DATA003 | データ不整合 | 参照整合性制約違反 | 400 | "データに不整合があります。ページを更新してください。" | ページリロードボタン表示 |
| DATA004 | リソース不存在 | 指定されたIDのリソースが存在しない | 404 | "指定されたデータが見つかりません。" | 一覧画面へリダイレクト |

### 1.3 バリデーション系エラー

| エラーコード | エラー名 | 発生条件 | HTTPステータス | エラーメッセージ | 処理方法 |
|---|---|---|---|---|---|
| VALID001 | 必須項目未入力 | 必須フィールドが空 | 400 | "{フィールド名}は必須項目です。" | 該当フィールドにエラー表示、フォーカス |
| VALID002 | 文字数超過 | 最大文字数を超過 | 400 | "{フィールド名}は{最大文字数}文字以内で入力してください。" | 該当フィールドにエラー表示、文字数カウンター表示 |
| VALID003 | 不正な形式 | メールアドレスやURL形式不正 | 400 | "正しい{形式名}を入力してください。" | 該当フィールドにエラー表示、例示 |
| VALID004 | 重複エラー | 一意制約違反 | 409 | "この{項目名}は既に使用されています。" | 該当フィールドにエラー表示、代替案提示 |

### 1.4 ネットワーク系エラー

| エラーコード | エラー名 | 発生条件 | HTTPステータス | エラーメッセージ | 処理方法 |
|---|---|---|---|---|---|
| NETWORK001 | 通信タイムアウト | 30秒以内にレスポンスなし | 408 | "通信がタイムアウトしました。再度お試しください。" | リトライボタン表示 |
| NETWORK002 | ネットワーク切断 | インターネット接続なし | - | "インターネット接続を確認してください。" | オフライン表示、接続確認ボタン |

### 1.5 システム系エラー

| エラーコード | エラー名 | 発生条件 | HTTPステータス | エラーメッセージ | 処理方法 |
|---|---|---|---|---|---|
| SYSTEM001 | 予期せぬエラー | catch節で捕捉された例外 | 500 | "予期せぬエラーが発生しました。管理者にお問い合わせください。" | エラー詳細をログ送信、お問い合わせフォームへのリンク |
| SYSTEM002 | メンテナンス中 | サーバーメンテナンス | 503 | "現在メンテナンス中です。しばらくお待ちください。" | メンテナンス終了予定時刻表示 |

## 2. API仕様書（リクエストとレスポンスの型定義）

### 2.1 認証API

#### POST /auth/login
**説明**: Googleアカウントでログイン

**リクエスト**:
```json
{
  "googleIdToken": "string (required) - GoogleのIDトークン"
}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "string - ユーザーID",
      "displayName": "string - 表示名",
      "email": "string - メールアドレス",
      "profileImage": "string | null - プロフィール画像URL",
      "isProgressPublic": "boolean - 進捗公開設定"
    },
    "token": "string - JWTトークン"
  }
}
```

**エラーレスポンス (401 Unauthorized)**:
```json
{
  "success": false,
  "error": {
    "code": "AUTH001",
    "message": "ログインに失敗しました。再度お試しください。"
  }
}
```

### 2.2 ユーザーAPI

#### GET /users/profile
**説明**: ユーザープロフィール取得

**リクエストヘッダー**:
```
Authorization: Bearer {token}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "uid": "string",
    "displayName": "string",
    "email": "string",
    "targetCertification": "string | null",
    "startDate": "string | null - ISO8601形式",
    "isProgressPublic": "boolean",
    "profileImage": "string | null",
    "createdAt": "string - ISO8601形式",
    "updatedAt": "string - ISO8601形式"
  }
}
```

#### PUT /users/profile
**説明**: ユーザープロフィール更新

**リクエスト**:
```json
{
  "displayName": "string (optional) - 表示名",
  "targetCertification": "string | null (optional) - 目標資格",
  "isProgressPublic": "boolean (optional) - 進捗公開設定"
}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "プロフィールを更新しました。"
  }
}
```

### 2.3 資格テンプレートAPI

#### GET /certifications
**説明**: 資格テンプレート一覧取得

**クエリパラメータ**:
- `category` (optional): カテゴリーフィルター
- `difficultyLevel` (optional): 難易度フィルター

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "estimatedPeriod": "number",
      "difficultyLevel": "string",
      "passingScore": "number | null",
      "examFee": "number | null"
    }
  ]
}
```

#### GET /certifications/{certificationId}
**説明**: 資格テンプレート詳細取得

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "estimatedPeriod": "number",
    "difficultyLevel": "string",
    "officialUrl": "string | null",
    "passingScore": "number | null",
    "examFee": "number | null",
    "defaultTasks": [
      {
        "title": "string",
        "description": "string",
        "estimatedHours": "number",
        "orderIndex": "number"
      }
    ]
  }
}
```

### 2.4 プロジェクトAPI

#### GET /projects
**説明**: ユーザーのプロジェクト一覧取得

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectName": "string",
      "certification": {
        "id": "string",
        "name": "string"
      },
      "targetDate": "string | null",
      "status": "string",
      "progressPercentage": "number",
      "totalTasks": "number",
      "completedTasks": "number",
      "studiedHours": "number"
    }
  ]
}
```

#### POST /projects
**説明**: プロジェクト作成

**リクエスト**:
```json
{
  "certificationId": "string (required)",
  "projectName": "string (optional) - 未指定時は資格名をデフォルト使用",
  "targetDate": "string | null (optional) - ISO8601形式"
}
```

**レスポンス (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectName": "string",
    "certificationId": "string",
    "targetDate": "string | null",
    "status": "active",
    "progressPercentage": 0,
    "createdAt": "string"
  }
}
```

#### GET /projects/{projectId}
**説明**: プロジェクト詳細取得

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectName": "string",
    "certification": {
      "id": "string",
      "name": "string",
      "description": "string"
    },
    "targetDate": "string | null",
    "status": "string",
    "progressPercentage": "number",
    "totalTasks": "number",
    "completedTasks": "number",
    "totalEstimatedHours": "number",
    "studiedHours": "number",
    "tasks": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "estimatedHours": "number",
        "isCompleted": "boolean",
        "completedAt": "string | null",
        "orderIndex": "number",
        "notes": "string | null"
      }
    ]
  }
}
```

### 2.5 タスクAPI

#### POST /projects/{projectId}/tasks
**説明**: タスク作成

**リクエスト**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "estimatedHours": "number (required)",
  "orderIndex": "number (optional) - 未指定時は最後に追加"
}
```

**レスポンス (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "estimatedHours": "number",
    "isCompleted": false,
    "orderIndex": "number",
    "createdAt": "string"
  }
}
```

#### PUT /tasks/{taskId}
**説明**: タスク更新

**リクエスト**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "estimatedHours": "number (optional)",
  "isCompleted": "boolean (optional)",
  "notes": "string (optional)"
}
```

#### PUT /tasks/{taskId}/complete
**説明**: タスク完了

**リクエスト**:
```json
{
  "isPublic": "boolean (optional, default: false) - 完了を公開するか"
}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "タスクを完了しました。",
    "projectProgress": {
      "progressPercentage": "number",
      "completedTasks": "number",
      "totalTasks": "number"
    }
  }
}
```

### 2.6 コミュニティAPI

#### GET /community/users/{certificationId}
**説明**: 同じ資格を目指すユーザー一覧

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "uid": "string",
      "displayName": "string",
      "profileImage": "string | null",
      "progressPercentage": "number",
      "studiedHours": "number",
      "isFollowing": "boolean"
    }
  ]
}
```

#### GET /community/activities
**説明**: アクティビティフィード取得

**クエリパラメータ**:
- `limit` (optional, default: 20): 取得件数
- `offset` (optional, default: 0): オフセット

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "user": {
        "uid": "string",
        "displayName": "string",
        "profileImage": "string | null"
      },
      "project": {
        "id": "string",
        "name": "string",
        "certification": {
          "name": "string"
        }
      },
      "completedTaskTitle": "string | null",
      "message": "string | null",
      "likesCount": "number",
      "isLiked": "boolean",
      "createdAt": "string"
    }
  ]
}
```

#### POST /community/activities/{activityId}/like
**説明**: アクティビティにいいね

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likesCount": "number"
  }
}
```

#### DELETE /community/activities/{activityId}/like
**説明**: いいねを取り消し

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likesCount": "number"
  }
}
```

## 3. バリデーション設計書（データ構造の設計）

### 3.1 ユーザープロフィール画面

| 項目名 | 必須 | 最小文字数 | 最大文字数 | 形式 | その他のルール | エラーメッセージ |
|---|---|---|---|---|---|---|
| 表示名 | ○ | 1 | 50 | 文字列 | 特殊文字(< > & " ')禁止 | "表示名は1〜50文字で入力してください。特殊文字は使用できません。" |
| 目標資格 | × | 0 | 100 | 文字列 | - | "目標資格は100文字以内で入力してください。" |
| 進捗公開設定 | ○ | - | - | boolean | - | - |

### 3.2 プロジェクト作成画面

| 項目名 | 必須 | 最小文字数 | 最大文字数 | 形式 | その他のルール | エラーメッセージ |
|---|---|---|---|---|---|---|
| プロジェクト名 | × | 1 | 100 | 文字列 | 未入力時は資格名をデフォルト使用 | "プロジェクト名は1〜100文字で入力してください。" |
| 目標試験日 | × | - | - | 日付 | 今日以降の日付 | "目標試験日は今日以降の日付を選択してください。" |

### 3.3 タスク作成・編集画面

| 項目名 | 必須 | 最小文字数 | 最大文字数 | 形式 | その他のルール | エラーメッセージ |
|---|---|---|---|---|---|---|
| タスク名 | ○ | 1 | 200 | 文字列 | - | "タスク名は1〜200文字で入力してください。" |
| 説明 | × | 0 | 2000 | 文字列 | - | "説明は2000文字以内で入力してください。" |
| 推定学習時間 | ○ | - | - | 数値 | 0.5〜999.5（0.5時間刻み） | "推定学習時間は0.5〜999.5時間で入力してください。" |
| メモ | × | 0 | 2000 | 文字列 | - | "メモは2000文字以内で入力してください。" |

### 3.4 セキュリティバリデーション

#### 3.4.1 XSS対策
- 全ての入力項目でHTMLタグをエスケープ
- `<script>`タグ、`javascript:`スキームを禁止
- `onerror`、`onload`等のイベントハンドラを禁止

#### 3.4.2 SQLインジェクション対策
- Firestoreを使用するため基本的にリスクなし
- クエリパラメータの型チェックを実施

#### 3.4.3 認可チェック
- 全API呼び出し時に認証トークンを検証
- リソースの所有者チェック（自分のプロジェクト・タスクのみ操作可能）
- 公開設定に応じたデータアクセス制御

### 3.5 フロントエンド共通バリデーション

#### 3.5.1 リアルタイムバリデーション
- フォーカスアウト時にバリデーション実行
- 文字数カウンターのリアルタイム表示
- エラーメッセージの即座表示

#### 3.5.2 サブミット時バリデーション
- 全項目の再検証
- サーバーサイドバリデーションとの整合性チェック
- 重複送信防止

## 4. テスト設計書

### 4.1 単体テスト（Unit Test）

#### 4.1.1 認証機能
| テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|
| 正常なGoogleログイン | 有効なIDトークン | ログイン成功、ユーザー情報取得 | High |
| 無効なトークンでログイン | 無効なIDトークン | AUTH001エラー | High |
| 期限切れトークン | 期限切れIDトークン | AUTH002エラー | High |
| 未認証でのAPI呼び出し | 認証ヘッダーなし | AUTH001エラー | High |

#### 4.1.2 バリデーション機能
| テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|
| 表示名の正常入力 | "山田太郎" | バリデーション成功 | High |
| 表示名の空文字 | "" | VALID001エラー | High |
| 表示名の文字数超過 | 51文字の文字列 | VALID002エラー | High |
| 表示名の特殊文字 | "山田<script>太郎" | VALID003エラー | High |
| 推定時間の正常値 | 5.5 | バリデーション成功 | High |
| 推定時間の範囲外 | 1000 | VALID002エラー | High |
| 推定時間の負の値 | -1 | VALID003エラー | High |

#### 4.1.3 プロジェクト管理機能
| テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|
| プロジェクト作成 | 有効な資格ID | プロジェクト作成成功 | High |
| 存在しない資格でプロジェクト作成 | 無効な資格ID | DATA004エラー | Medium |
| 進捗率計算（タスクなし） | 0個のタスク | 進捗率: 0% | High |
| 進捗率計算（一部完了） | 10個中3個完了 | 進捗率: 30% | High |
| 進捗率計算（全完了） | 5個中5個完了 | 進捗率: 100% | High |

### 4.2 結合テスト（Integration Test）

#### 4.2.1 ユーザーフロー全体テスト
| テストケース | 手順 | 期待結果 | 優先度 |
|---|---|---|---|
| 新規ユーザー登録〜プロジェクト作成 | 1.Googleログイン → 2.プロフィール設定 → 3.資格選択 → 4.プロジェクト作成 | 全て正常完了 | High |
| タスク完了〜進捗更新 | 1.タスク完了 → 2.進捗率更新 → 3.アクティビティ生成 | 進捗率正常更新、アクティビティ生成 | High |
| コミュニティ機能 | 1.タスク完了公開 → 2.他ユーザーがいいね → 3.通知生成 | いいね数増加、通知生成 | Medium |

#### 4.2.2 権限・セキュリティテスト
| テストケース | 手順 | 期待結果 | 優先度 |
|---|---|---|---|
| 他ユーザーのプロジェクトアクセス | 他ユーザーのプロジェクトIDでAPI呼び出し | AUTH003エラー | High |
| 非公開プロジェクトの表示 | isProgressPublic=falseのプロジェクト参照 | データ非表示 | High |
| XSS攻撃テスト | `<script>alert('xss')</script>`をタスク名に入力 | スクリプト実行されずエスケープ表示 | High |

### 4.3 E2Eテスト（End-to-End Test）

#### 4.3.1 ユーザーシナリオテスト
| テストケース | シナリオ | 期待結果 | 優先度 |
|---|---|---|---|
| 資格勉強開始シナリオ | ログイン→資格選択→プロジェクト作成→タスク追加→学習開始 | スムーズな操作でプロジェクト開始 | High |
| 学習継続シナリオ | タスク完了→進捗確認→他ユーザーの励まし→モチベーション向上 | コミュニティ機能による継続支援 | High |
| 資格合格シナリオ | 全タスク完了→進捗100%→合格報告→お祝い表示 | 達成感のある完了体験 | Medium |

#### 4.3.2 パフォーマンステスト
| テストケース | 条件 | 期待結果 | 優先度 |
|---|---|---|---|
| ページロード性能 | 初回アクセス | 3秒以内にページ表示完了 | High |
| 大量データ表示 | 100個のタスクを持つプロジェクト | スムーズなスクロール、遅延なし | Medium |
| 同時アクセス | 100人同時アクセス | レスポンス時間5秒以内 | Low |

#### 4.3.3 レスポンシブデザインテスト
| テストケース | デバイス | 期待結果 | 優先度 |
|---|---|---|---|
| PC表示 | 1920x1080 | デザイン崩れなし、全機能利用可能 | High |
| タブレット表示 | 768x1024 | レスポンシブ対応、タッチ操作対応 | Medium |
| スマートフォン表示 | 375x667 | モバイル最適化表示 | Medium |

### 4.4 性能テスト

#### 4.4.1 ロードテスト
| 項目 | 目標値 | 測定方法 | 優先度 |
|---|---|---|---|
| ページロード時間 | 3秒以内 | Lighthouse計測 | High |
| APIレスポンス時間 | 1秒以内 | 開発者ツール Network タブ | High |
| データベースクエリ時間 | 500ms以内 | Firebase Performance Monitoring | Medium |

#### 4.4.2 ストレステスト
| 項目 | 条件 | 期待結果 | 優先度 |
|---|---|---|---|
| 同時接続数 | 100ユーザー同時アクセス | エラー率5%以下 | Medium |
| データ量 | 1ユーザー1000タスク | 表示性能劣化なし | Low |

## 5. WBS（作業分解）

### 5.1 開発フェーズ全体計画

| フェーズ | 期間 | 工数(時間) | 重要度 | 依存関係 |
|---|---|---|---|---|
| **Phase1: 基盤構築** | 2週間 | 60時間 | Critical | - |
| **Phase2: 認証・ユーザー管理** | 1週間 | 30時間 | Critical | Phase1完了後 |
| **Phase3: プロジェクト・タスク管理** | 3週間 | 90時間 | Critical | Phase2完了後 |
| **Phase4: コミュニティ機能** | 2週間 | 60時間 | High | Phase3完了後 |
| **Phase5: UI/UX改善** | 1.5週間 | 45時間 | High | Phase4完了後 |
| **Phase6: テスト・デバッグ** | 1.5週間 | 45時間 | Critical | Phase5完了後 |
| **合計** | **11週間** | **330時間** | - | - |

### 5.2 Phase1: 基盤構築（2週間、60時間）

| タスクID | タスク名 | 工数 | デッドライン | 成果物 | 優先度 | 詳細 |
|---|---|---|---|---|---|---|
| P1-01 | 開発環境セットアップ | 8時間 | Day 2 | 環境構築ドキュメント | Critical | Next.js、Firebase、TailwindCSS |
| P1-02 | プロジェクト構造設計 | 6時間 | Day 3 | フォルダ構成ドキュメント | Critical | ファイル構成、命名規則 |
| P1-03 | Firebase設定 | 8時間 | Day 5 | Firebase設定完了 | Critical | Authentication、Firestore、Storage |
| P1-04 | 基本レイアウト実装 | 12時間 | Day 8 | 共通コンポーネント | High | Header、Footer、Navigation |
| P1-05 | ルーティング設定 | 6時間 | Day 10 | ページ遷移機能 | High | Next.js App Router設定 |
| P1-06 | エラーハンドリング基盤 | 8時間 | Day 12 | エラー処理ライブラリ | High | エラー境界、トースト通知 |
| P1-07 | 状態管理セットアップ | 8時間 | Day 14 | 状態管理設定 | High | Zustand or Redux Toolkit |
| P1-08 | TypeScript型定義 | 4時間 | Day 14 | 型定義ファイル | Medium | 基本的なインターフェース定義 |

### 5.3 Phase2: 認証・ユーザー管理（1週間、30時間）

| タスクID | タスク名 | 工数 | デッドライン | 成果物 | 優先度 | 詳細 |
|---|---|---|---|---|---|---|
| P2-01 | Firebase Auth設定 | 6時間 | Day 16 | 認証機能基盤 | Critical | Google OAuth設定 |
| P2-02 | ログイン画面実装 | 8時間 | Day 18 | ログイン画面 | Critical | UI実装、認証フロー |
| P2-03 | ユーザープロフィール機能 | 10時間 | Day 20 | プロフィール画面 | Critical | 表示・編集機能 |
| P2-04 | 認証ガード実装 | 4時間 | Day 21 | 認証保護機能 | High | ルート保護、リダイレクト |
| P2-05 | ユーザーデータ初期化 | 2時間 | Day 21 | 初期データ作成 | Medium | 新規ユーザー登録時処理 |

### 5.4 Phase3: プロジェクト・タスク管理（3週間、90時間）

| タスクID | タスク名 | 工数 | デッドライン | 成果物 | 優先度 | 詳細 |
|---|---|---|---|---|---|---|
| P3-01 | 資格マスターデータ作成 | 6時間 | Day 23 | 資格データ | Critical | Firestoreに資格情報登録 |
| P3-02 | 資格選択画面実装 | 12時間 | Day 26 | 資格選択UI | Critical | 一覧表示、フィルター機能 |
| P3-03 | プロジェクト作成機能 | 14時間 | Day 30 | プロジェクト作成 | Critical | テンプレートからプロジェクト生成 |
| P3-04 | タスク管理機能（基本CRUD） | 16時間 | Day 35 | タスク操作機能 | Critical | 作成・読取・更新・削除 |
| P3-05 | プロジェクトダッシュボード | 12時間 | Day 38 | 進捗表示画面 | High | 進捗率、統計情報表示 |
| P3-06 | タスク完了機能 | 8時間 | Day 40 | 完了処理 | High | 完了状態切り替え、進捗更新 |
| P3-07 | タスク並び替え機能 | 8時間 | Day 42 | ドラッグ&ドロップ | Medium | 順序変更機能 |
| P3-08 | バリデーション実装 | 6時間 | Day 42 | 入力検証 | High | フロント・バックエンド検証 |
| P3-09 | プロジェクト設定機能 | 8時間 | Day 42 | 設定画面 | Medium | 目標日設定、プロジェクト名変更 |

### 5.5 Phase4: コミュニティ機能（2週間、60時間）

| タスクID | タスク名 | 工数 | デッドライン | 成果物 | 優先度 | 詳細 |
|---|---|---|---|---|---|---|
| P4-01 | アクティビティデータ設計 | 4時間 | Day 44 | データベース設計 | High | アクティビティフィード設計 |
| P4-02 | 同じ資格挑戦者表示 | 10時間 | Day 47 | ユーザー一覧画面 | High | 進捗表示、フィルター機能 |
| P4-03 | アクティビティフィード実装 | 12時間 | Day 50 | フィード画面 | High | タイムライン表示 |
| P4-04 | いいね機能実装 | 8時間 | Day 52 | いいね機能 | High | いいね送信・取消 |
| P4-05 | タスク完了公開機能 | 8時間 | Day 54 | 公開設定 | High | 完了時の公開オプション |
| P4-06 | フォロー機能実装 | 10時間 | Day 56 | フォロー機能 | Medium | ユーザーフォロー・アンフォロー |
| P4-07 | 通知機能（基本） | 6時間 | Day 56 | 通知表示 | Medium | いいね通知 |
| P4-08 | コミュニティページ統合 | 2時間 | Day 56 | 統合画面 | Low | ナビゲーション統合 |

### 5.6 Phase5: UI/UX改善（1.5週間、45時間）

| タスクID | タスク名 | 工数 | デッドライン | 成果物 | 優先度 | 詳細 |
|---|---|---|---|---|---|---|
| P5-01 | レスポンシブデザイン対応 | 12時間 | Day 60 | モバイル対応 | High | スマホ・タブレット表示 |
| P5-02 | アニメーション実装 | 8時間 | Day 62 | 動的UI | Medium | ページ遷移、ホバーエフェクト |
| P5-03 | ローディング状態改善 | 6時間 | Day 64 | ローディングUI | High | スケルトン、スピナー |
| P5-04 | エラー画面デザイン | 4時間 | Day 65 | エラーページ | Medium | 404、500エラーページ |
| P5-05 | パフォーマンス最適化 | 8時間 | Day 66 | 高速化 | High | 画像最適化、コード分割 |
| P5-06 | アクセシビリティ対応 | 4時間 | Day 67 | a11y対応 | Medium | WAI-ARIA、キーボード操作 |
| P5-07 | デザインシステム統一 | 3時間 | Day 67 | スタイルガイド | Low | 色彩、フォント統一 |

### 5.7 Phase6: テスト・デバッグ（1.5週間、45時間）

| タスクID | タスク名 | 工数 | デッドライン | 成果物 | 優先度 | 詳細 |
|---|---|---|---|---|---|---|
| P6-01 | 単体テスト作成 | 12時間 | Day 70 | テストコード | High | Jest、React Testing Library |
| P6-02 | 結合テスト実施 | 8時間 | Day 72 | テスト結果 | High | API連携テスト |
| P6-03 | E2Eテスト実施 | 10時間 | Day 74 | E2Eテスト | Medium | Playwright使用 |
| P6-04 | セキュリティテスト | 6時間 | Day 75 | セキュリティ報告書 | High | 脆弱性検査 |
| P6-05 | パフォーマンステスト | 4時間 | Day 76 | 性能測定結果 | Medium | Lighthouse、負荷テスト |
| P6-06 | バグ修正・調整 | 5時間 | Day 77 | 修正版 | Critical | 発見された問題の修正 |

### 5.8 リスク管理・予備時間

| リスク項目 | 発生確率 | 影響度 | 対策 | 予備時間 |
|---|---|---|---|---|
| Firebase制限・料金問題 | Medium | High | 代替DB検討、制限監視 | 16時間 |
| 認証機能の複雑化 | Low | Medium | 認証ライブラリ使用 | 8時間 |
| パフォーマンス問題 | High | Medium | 早期テスト、最適化 | 12時間 |
| UI/UXの大幅修正 | Medium | Medium | 早期レビュー、段階的実装 | 10時間 |
| **合計予備時間** | - | - | - | **46時間** |

### 5.9 マイルストーン・デリバリ計画

| マイルストーン | 期限 | 成果物 | 確認項目 |
|---|---|---|---|
| **MVP完成** | Day 42 | 基本機能一式 | ログイン〜プロジェクト作成〜タスク管理 |
| **β版完成** | Day 56 | コミュニティ機能追加 | 全機能動作確認 |
| **製品版完成** | Day 77 | 最終版 | 全テスト完了、本番デプロイ準備 |

### 5.10 開発環境・ツール

| 分類 | ツール・技術 | 用途 | 習得時間 |
|---|---|---|---|
| **フロントエンド** | Next.js 14, React 18, TypeScript | メインフレームワーク | 既習 |
| **スタイリング** | TailwindCSS, Framer Motion | UI/アニメーション | 4時間 |
| **バックエンド** | Firebase (Auth, Firestore, Storage) | BaaS | 8時間 |
| **状態管理** | Zustand | 軽量状態管理 | 2時間 |
| **テスト** | Jest, React Testing Library, Playwright | テスト自動化 | 6時間 |
| **開発支援** | ESLint, Prettier, Husky | コード品質 | 2時間 |
| **デプロイ** | Vercel | ホスティング | 1時間 |

## 6. 補足資料

### 6.1 開発優先度の判断基準

| 優先度 | 基準 | 該当機能例 |
|---|---|---|
| **Critical** | システムの基本動作に必須 | 認証、プロジェクト作成、タスク管理 |
| **High** | ユーザー体験に大きく影響 | 進捗表示、コミュニティ機能 |
| **Medium** | あると良い機能 | ドラッグ&ドロップ、アニメーション |
| **Low** | 将来的な拡張機能 | 高度な統計、詳細設定 |

### 6.2 技術的負債・将来対応項目

| 項目 | 現状 | 将来対応 | 優先度 |
|---|---|---|---|
| 画像最適化 | 基本的な対応 | CDN、WebP対応 | Medium |
| オフライン対応 | 未対応 | Service Worker | Low |
| 多言語対応 | 日本語のみ | i18n導入 | Low |
| 高度な分析 | 基本的な進捗のみ | 学習時間分析、予測 | Low |
| 通知機能 | 画面内通知のみ | Push通知、メール | Medium |

この設計書に基づいて、段階的に開発を進めることで、確実に目標の機能を実現できます。特にPhase1〜3は基盤となる重要な部分なので、しっかりと時間をかけて実装することをお勧めします。