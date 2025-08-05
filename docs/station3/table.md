# CertPath テーブル定義書

## 1. 概要

### データベース情報
- **データベース種類**: Firebase Firestore
- **作成日**: 2025年8月
- **バージョン**: 1.0
- **文字エンコード**: UTF-8

### 命名規則
- **コレクション名**: PascalCase（例：Users、UserProjects）
- **フィールド名**: camelCase（例：displayName、createdAt）
- **外部キー**: 参照先 + Id（例：userId、certificationId）

## 2. テーブル（コレクション）定義

### 2.1 Users（ユーザー）
ユーザーアカウント情報を管理するメインテーブル

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| uid | string | PK, NOT NULL | Firebase Auth UID | "abc123def456" |
| displayName | string | NOT NULL | 表示名（3-20文字） | "太郎" |
| email | string | NOT NULL, UNIQUE | メールアドレス | "taro@example.com" |
| targetCertification | string | NULL | 現在の目標資格 | "基本情報技術者" |
| startDate | timestamp | NULL | 学習開始日 | 2025-01-15T00:00:00Z |
| isProgressPublic | boolean | NOT NULL, DEFAULT true | 進捗公開フラグ | true |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |
| updatedAt | timestamp | NOT NULL | 更新日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- uid (Primary)
- email (Unique)
- targetCertification (Query)
- createdAt (Query)

**セキュリティルール:**
```javascript
// ユーザーは自分のデータのみ読み書き可能
allow read, write: if request.auth != null && request.auth.uid == resource.id;
```

---

### 2.2 CertificationTemplates（資格テンプレート）
資格試験のテンプレート情報を管理

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| id | string | PK, NOT NULL | テンプレートID | "basic_info_2025" |
| name | string | NOT NULL | 資格名 | "基本情報技術者試験" |
| description | text | NOT NULL | 資格説明 | "ITエンジニアの基礎知識..." |
| category | string | NOT NULL | カテゴリ | "IT基礎" |
| estimatedPeriod | number | NOT NULL | 推定学習期間（日） | 90 |
| difficultyLevel | string | NOT NULL | 難易度 | "初級/中級/上級" |
| isActive | boolean | NOT NULL, DEFAULT true | 有効フラグ | true |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |
| updatedAt | timestamp | NOT NULL | 更新日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- id (Primary)
- category (Query)
- isActive (Query)
- createdAt (Query)

---

### 2.3 TemplateTasks（テンプレートタスク）
資格テンプレートに含まれるタスクの詳細

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| id | string | PK, NOT NULL | タスクID | "task_basic_001" |
| certificationId | string | FK, NOT NULL | 資格テンプレートID | "basic_info_2025" |
| title | string | NOT NULL | タスク名 | "基礎理論の学習" |
| description | text | NOT NULL | タスク詳細 | "数学基礎、論理演算を学習" |
| estimatedHours | number | NOT NULL | 推定学習時間 | 20 |
| priority | number | NOT NULL | 優先度（1-5） | 3 |
| orderIndex | number | NOT NULL | 表示順序 | 1 |
| referenceLinks | array | NULL | 参考リンク配列 | ["https://...", "https://..."] |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- id (Primary)
- certificationId (Query)
- orderIndex (Query)

**参考リンク構造:**
```json
{
  "referenceLinks": [
    {
      "title": "基礎理論解説サイト",
      "url": "https://example.com",
      "type": "website"
    }
  ]
}
```

---

### 2.4 UserProjects（ユーザープロジェクト）
ユーザーが作成した学習プロジェクト

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| id | string | PK, NOT NULL | プロジェクトID | "proj_user1_001" |
| userId | string | FK, NOT NULL | ユーザーID | "abc123def456" |
| certificationId | string | FK, NOT NULL | 資格テンプレートID | "basic_info_2025" |
| projectName | string | NOT NULL | プロジェクト名 | "基本情報 2025年春試験" |
| targetDate | date | NULL | 目標試験日 | 2025-04-20 |
| status | string | NOT NULL | ステータス | "active/completed/paused" |
| progressPercentage | number | NOT NULL, DEFAULT 0 | 進捗率（0-100） | 65 |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |
| updatedAt | timestamp | NOT NULL | 更新日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- id (Primary)
- userId (Query)
- status (Query)
- targetDate (Query)
- createdAt (Query)

---

### 2.5 UserTasks（ユーザータスク）
ユーザーがカスタマイズしたタスクの詳細

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| id | string | PK, NOT NULL | ユーザータスクID | "utask_001" |
| userProjectId | string | FK, NOT NULL | ユーザープロジェクトID | "proj_user1_001" |
| templateTaskId | string | FK, NULL | テンプレートタスクID | "task_basic_001" |
| title | string | NOT NULL | タスク名 | "基礎理論の学習" |
| description | text | NULL | タスク詳細 | "カスタマイズした説明" |
| estimatedHours | number | NOT NULL | 推定学習時間 | 25 |
| isCompleted | boolean | NOT NULL, DEFAULT false | 完了フラグ | false |
| completedAt | timestamp | NULL | 完了日時 | null |
| orderIndex | number | NOT NULL | 表示順序 | 1 |
| isCustomTask | boolean | NOT NULL, DEFAULT false | カスタムタスクフラグ | false |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |
| updatedAt | timestamp | NOT NULL | 更新日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- id (Primary)
- userProjectId (Query)
- isCompleted (Query)
- orderIndex (Query)

---

### 2.6 CommunityActivity（コミュニティ活動）
ユーザーの学習活動を記録し、コミュニティで共有

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| id | string | PK, NOT NULL | アクティビティID | "activity_001" |
| userId | string | FK, NOT NULL | ユーザーID | "abc123def456" |
| userProjectId | string | FK, NOT NULL | プロジェクトID | "proj_user1_001" |
| activityType | string | NOT NULL | アクティビティ種別 | "task_completed" |
| message | string | NULL | メッセージ | "基礎理論の学習完了！" |
| progressPercentage | number | NULL | その時点の進捗率 | 65 |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- id (Primary)
- userId (Query)
- userProjectId (Query)
- activityType (Query)
- createdAt (Query, DESC)

**アクティビティ種別:**
- `progress_update`: 進捗更新
- `task_completed`: タスク完了
- `project_completed`: プロジェクト完了

---

### 2.7 Likes（いいね）
ユーザー間のいいね・応援機能

| フィールド名 | データ型 | 制約 | 説明 | 例 |
|-------------|----------|------|------|-----|
| id | string | PK, NOT NULL | いいねID | "like_001" |
| userId | string | FK, NOT NULL | いいねした人のID | "user123" |
| targetUserId | string | FK, NOT NULL | いいねされた人のID | "user456" |
| activityId | string | FK, NOT NULL | 対象アクティビティID | "activity_001" |
| likeType | string | NOT NULL | いいね種別 | "like/cheer" |
| createdAt | timestamp | NOT NULL | 作成日時 | 2025-01-01T10:00:00Z |

**インデックス:**
- id (Primary)
- userId + activityId (Composite, Unique)
- activityId (Query)
- targetUserId (Query)

**いいね種別:**
- `like`: 👍 いいね
- `cheer`: 📣 応援

---

## 3. データサイズ見積もり

### 想定データ量（1年後）
- **Users**: 1,000人
- **CertificationTemplates**: 50資格
- **TemplateTasks**: 1,250タスク（平均25タスク/資格）
- **UserProjects**: 3,000プロジェクト（平均3プロジェクト/人）
- **UserTasks**: 75,000タスク（平均25タスク/プロジェクト）
- **CommunityActivity**: 25,000アクティビティ
- **Likes**: 75,000いいね

### Firestore コスト見積もり
- **読み取り**: 約200万回/月
- **書き込み**: 約20万回/月
- **ストレージ**: 約1GB
- **推定月額**: $100-200

## 4. パフォーマンス最適化

### インデックス戦略
1. **複合インデックス**:
   - `(userId, status)` - UserProjects
   - `(userId, createdAt DESC)` - UserProjects
   - `(userProjectId, isCompleted)` - UserTasks
   - `(userProjectId, orderIndex)` - UserTasks
   - `(activityType, createdAt DESC)` - CommunityActivity
   - `(userId, activityId)` - Likes (重複防止)

2. **範囲クエリ最適化**:
   - `targetDate` 範囲検索用インデックス
   - `progressPercentage` 範囲検索用インデックス
   - `createdAt` 時系列データ用インデックス

### キャッシュ戦略
- **CertificationTemplates**: 24時間キャッシュ（静的データ）
- **TemplateTasks**: 24時間キャッシュ（静的データ）
- **UserProjects**: リアルタイム更新（重要データ）
- **UserTasks**: リアルタイム更新（重要データ）
- **CommunityActivity**: 30秒キャッシュ（SNS風機能）
- **Likes**: リアルタイム更新（即座に反映）

## 5. セキュリティ設計

### Firebase Security Rules 例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: 自分のデータのみアクセス可能
    match /Users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // UserProjects: 自分のプロジェクトのみアクセス可能
    match /UserProjects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // UserTasks: 自分のタスクのみアクセス可能
    match /UserTasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == get(/databases/$(database)/documents/UserProjects/$(resource.data.userProjectId)).data.userId;
    }
    
    // CommunityActivity: プライベート設定考慮
    match /CommunityActivity/{activityId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/Users/$(resource.data.userId)).data.isProgressPublic == true || 
         request.auth.uid == resource.data.userId);
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Likes: 認証ユーザーのみ
    match /Likes/{likeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 6. 運用・保守

### バックアップ戦略
- 自動バックアップ：毎日午前2時
- 保存期間：30日間
- 重要データの手動バックアップ：週1回

### モニタリング項目
- データベース読み書き回数
- 平均応答時間
- エラー率
- ユーザーアクティビティ

---

このテーブル定義書により、CertPathアプリケーションのデータベース設計が完了します。
次の工程では、このテーブル構造を基にAPI仕様書を作成していきます。