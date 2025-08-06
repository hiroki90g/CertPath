# CertPath API仕様書

## 1. 概要

### API基本情報
- **プロジェクト名**: CertPath
- **バージョン**: v1.0
- **ベースURL**: https://certpath-app.web.app/api/v1
- **認証方式**: Firebase Authentication (JWT)
- **データ形式**: JSON
- **文字エンコード**: UTF-8

### アーキテクチャ
- **フロントエンド**: React (Direct Firestore SDK)
- **バックエンド**: Firebase Firestore + Cloud Functions
- **認証**: Firebase Authentication
- **ストレージ**: Firebase Storage (プロフィール画像)

### エンドポイント構成
```
Direct Firestore (リアルタイム)
├── Users Collection
├── UserProjects Collection
├── UserTasks Collection
└── CommunityActivity Collection

Cloud Functions (ビジネスロジック)
├── /api/v1/auth/*
├── /api/v1/projects/*
├── /api/v1/community/*
└── /api/v1/certifications/*
```

## 2. 認証・セキュリティ

### 2.1 認証フロー
```javascript
// Firebase Auth トークン取得
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// API リクエストヘッダー
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 2.2 エラーレスポンス形式
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です",
    "details": "Firebase Auth token is missing or invalid"
  },
  "timestamp": "2025-01-01T10:00:00Z",
  "requestId": "req_123456"
}
```

## 3. API エンドポイント詳細

### 3.1 認証 (Authentication)

#### POST /api/v1/auth/register
新規ユーザー登録（プロフィール情報の初期設定）

**リクエスト:**
```json
{
  "displayName": "太郎",
  "targetCertification": "基本情報技術者",
  "isProgressPublic": true
}
```

**レスポンス (201 Created):**
```json
{
  "user": {
    "uid": "abc123def456",
    "displayName": "太郎",
    "email": "taro@example.com",
    "targetCertification": "基本情報技術者",
    "isProgressPublic": true,
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### GET /api/v1/auth/profile
現在のユーザー情報取得

**レスポンス (200 OK):**
```json
{
  "user": {
    "uid": "abc123def456",
    "displayName": "太郎",
    "email": "taro@example.com",
    "targetCertification": "基本情報技術者",
    "startDate": "2025-01-01T00:00:00Z",
    "isProgressPublic": true,
    "profileImage": "https://storage.googleapis.com/...",
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  }
}
```

#### PUT /api/v1/auth/profile
ユーザー情報更新

**リクエスト:**
```json
{
  "displayName": "太郎",
  "targetCertification": "応用情報技術者",
  "isProgressPublic": false
}
```

**レスポンス (200 OK):**
```json
{
  "user": {
    "uid": "abc123def456",
    "displayName": "太郎",
    "targetCertification": "応用情報技術者",
    "isProgressPublic": false,
    "updatedAt": "2025-01-01T11:00:00Z"
  }
}
```

### 3.2 資格・テンプレート (Certifications)

#### GET /api/v1/certifications
利用可能な資格一覧取得

**クエリパラメータ:**
- `category` (optional): カテゴリフィルター
- `difficulty` (optional): 難易度フィルター

**レスポンス (200 OK):**
```json
{
  "certifications": [
    {
      "id": "basic_info_2025",
      "name": "基本情報技術者試験",
      "description": "ITエンジニアの基礎知識を問う国家試験",
      "category": "IT基礎",
      "estimatedPeriod": 90,
      "difficultyLevel": "初級",
      "officialUrl": "https://www.jitec.ipa.go.jp/",
      "passingScore": 60,
      "examFee": 7500,
      "taskCount": 25,
      "totalEstimatedHours": 120
    }
  ],
  "totalCount": 4,
  "page": 1,
  "limit": 10
}
```

#### GET /api/v1/certifications/{certificationId}
特定の資格詳細取得

**レスポンス (200 OK):**
```json
{
  "certification": {
    "id": "basic_info_2025",
    "name": "基本情報技術者試験",
    "description": "ITエンジニアの基礎知識を問う国家試験",
    "category": "IT基礎",
    "estimatedPeriod": 90,
    "difficultyLevel": "初級",
    "officialUrl": "https://www.jitec.ipa.go.jp/",
    "passingScore": 60,
    "examFee": 7500
  }
}
```

#### GET /api/v1/certifications/{certificationId}/tasks
資格のテンプレートタスク一覧取得

**レスポンス (200 OK):**
```json
{
  "tasks": [
    {
      "id": "task_basic_001",
      "title": "基礎理論の学習",
      "description": "数学基礎、論理演算を学習する",
      "estimatedHours": 20,
      "priority": 3,
      "orderIndex": 1,
      "referenceLinks": [
        {
          "title": "基礎理論解説サイト",
          "url": "https://example.com",
          "type": "website"
        }
      ],
      "tags": ["数学", "基礎"]
    }
  ],
  "totalCount": 25,
  "totalEstimatedHours": 120
}
```

### 3.3 プロジェクト管理 (Projects)

#### POST /api/v1/projects
新しいプロジェクト作成（テンプレートからコピー）

**リクエスト:**
```json
{
  "certificationId": "basic_info_2025",
  "projectName": "基本情報 2025年春試験",
  "targetDate": "2025-04-20",
  "customTasks": [
    {
      "title": "追加の模擬試験",
      "description": "より多くの問題演習",
      "estimatedHours": 10,
      "orderIndex": 26
    }
  ]
}
```

**レスポンス (201 Created):**
```json
{
  "project": {
    "id": "proj_user1_001",
    "userId": "abc123def456",
    "certificationId": "basic_info_2025",
    "projectName": "基本情報 2025年春試験",
    "targetDate": "2025-04-20",
    "status": "active",
    "progressPercentage": 0,
    "totalTasks": 26,
    "completedTasks": 0,
    "totalEstimatedHours": 130,
    "studiedHours": 0,
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### GET /api/v1/projects
ユーザーのプロジェクト一覧取得

**クエリパラメータ:**
- `status` (optional): active/completed/paused
- `limit` (optional): デフォルト10
- `offset` (optional): デフォルト0

**レスポンス (200 OK):**
```json
{
  "projects": [
    {
      "id": "proj_user1_001",
      "certificationName": "基本情報技術者試験",
      "projectName": "基本情報 2025年春試験",
      "targetDate": "2025-04-20",
      "status": "active",
      "progressPercentage": 65,
      "totalTasks": 26,
      "completedTasks": 17,
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-15T08:30:00Z"
    }
  ],
  "totalCount": 3
}
```

#### GET /api/v1/projects/{projectId}
プロジェクト詳細取得

**レスポンス (200 OK):**
```json
{
  "project": {
    "id": "proj_user1_001",
    "userId": "abc123def456",
    "certification": {
      "id": "basic_info_2025",
      "name": "基本情報技術者試験",
      "category": "IT基礎"
    },
    "projectName": "基本情報 2025年春試験",
    "targetDate": "2025-04-20",
    "status": "active",
    "progressPercentage": 65,
    "totalTasks": 26,
    "completedTasks": 17,
    "totalEstimatedHours": 130,
    "studiedHours": 85,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-15T08:30:00Z"
  }
}
```

#### PUT /api/v1/projects/{projectId}
プロジェクト情報更新

**リクエスト:**
```json
{
  "projectName": "基本情報 2025年春試験（集中学習）",
  "targetDate": "2025-04-15",
  "status": "active"
}
```

**レスポンス (200 OK):**
```json
{
  "project": {
    "id": "proj_user1_001",
    "projectName": "基本情報 2025年春試験（集中学習）",
    "targetDate": "2025-04-15",
    "status": "active",
    "updatedAt": "2025-01-15T09:00:00Z"
  }
}
```

### 3.4 タスク管理 (Tasks)

#### GET /api/v1/projects/{projectId}/tasks
プロジェクトのタスク一覧取得

**クエリパラメータ:**
- `completed` (optional): true/false
- `orderBy` (optional): orderIndex/priority

**レスポンス (200 OK):**
```json
{
  "tasks": [
    {
      "id": "utask_001",
      "userProjectId": "proj_user1_001",
      "templateTaskId": "task_basic_001",
      "title": "基礎理論の学習",
      "description": "数学基礎、論理演算を学習する",
      "estimatedHours": 20,
      "isCompleted": false,
      "completedAt": null,
      "orderIndex": 1,
      "isCustomTask": false,
      "notes": "",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-01T10:00:00Z"
    }
  ],
  "totalCount": 26,
  "completedCount": 17
}
```

#### PUT /api/v1/tasks/{taskId}
タスク更新（完了状態変更・編集）

**リクエスト:**
```json
{
  "isCompleted": true,
  "notes": "難しかったが理解できた",
  "studiedHours": 22
}
```

**レスポンス (200 OK):**
```json
{
  "task": {
    "id": "utask_001",
    "isCompleted": true,
    "completedAt": "2025-01-15T10:30:00Z",
    "notes": "難しかったが理解できた",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "projectUpdate": {
    "progressPercentage": 69,
    "completedTasks": 18,
    "studiedHours": 87
  }
}
```

#### POST /api/v1/projects/{projectId}/tasks
カスタムタスク追加

**リクエスト:**
```json
{
  "title": "追加の模擬試験",
  "description": "弱点補強のための追加演習",
  "estimatedHours": 8,
  "orderIndex": 27
}
```

**レスポンス (201 Created):**
```json
{
  "task": {
    "id": "utask_custom_001",
    "userProjectId": "proj_user1_001",
    "templateTaskId": null,
    "title": "追加の模擬試験",
    "description": "弱点補強のための追加演習",
    "estimatedHours": 8,
    "isCompleted": false,
    "orderIndex": 27,
    "isCustomTask": true,
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
```

### 3.5 コミュニティ (Community)

#### GET /api/v1/community/activities
コミュニティ活動一覧取得

**クエリパラメータ:**
- `certificationId` (optional): 特定の資格に絞る
- `activityType` (optional): activity種別フィルター
- `limit` (optional): デフォルト20
- `cursor` (optional): ページング用

**レスポンス (200 OK):**
```json
{
  "activities": [
    {
      "id": "activity_001",
      "user": {
        "uid": "user456",
        "displayName": "花子",
        "profileImage": "https://..."
      },
      "certification": {
        "id": "basic_info_2025",
        "name": "基本情報技術者試験"
      },
      "activityType": "task_completed",
      "message": "基礎理論の学習完了！",
      "progressPercentage": 65,
      "completedTaskTitle": "基礎理論の学習",
      "likesCount": 3,
      "isLikedByUser": false,
      "createdAt": "2025-01-15T09:00:00Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "cursor_abc123"
}
```

#### GET /api/v1/community/users
同じ資格を目指すユーザー一覧

**クエリパラメータ:**
- `certificationId` (required): 資格ID
- `limit` (optional): デフォルト10

**レスポンス (200 OK):**
```json
{
  "users": [
    {
      "uid": "user456",
      "displayName": "花子",
      "profileImage": "https://...",
      "currentProject": {
        "id": "proj_user2_001",
        "projectName": "基本情報 2025年春試験",
        "progressPercentage": 75,
        "startDate": "2024-12-01T00:00:00Z"
      },
      "isProgressPublic": true
    }
  ],
  "totalCount": 15
}
```

#### POST /api/v1/community/activities/{activityId}/likes
いいね・応援を送る

**リクエスト:**
```json
{
  "likeType": "cheer"
}
```

**レスポンス (201 Created):**
```json
{
  "like": {
    "id": "like_001",
    "userId": "abc123def456",
    "targetUserId": "user456",
    "activityId": "activity_001",
    "likeType": "cheer",
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "newLikesCount": 4
}
```

#### DELETE /api/v1/community/activities/{activityId}/likes
いいね・応援を取り消す

**レスポンス (200 OK):**
```json
{
  "message": "いいねを取り消しました",
  "newLikesCount": 3
}
```

## 4. Firebase Firestore Direct Access

### 4.1 リアルタイムリスナー
フロントエンドからFirestoreに直接アクセスする機能

```javascript
// ユーザープロジェクトのリアルタイム監視
const unsubscribe = db.collection('UserProjects')
  .where('userId', '==', currentUser.uid)
  .onSnapshot((snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProjects(projects);
  });

// コミュニティ活動のリアルタイム監視
const unsubscribeCommunity = db.collection('CommunityActivity')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .onSnapshot((snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setActivities(activities);
  });
```

### 4.2 セキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: 自分のデータのみ読み書き可能
    match /Users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // UserProjects: 自分のプロジェクトのみ読み書き可能
    match /UserProjects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // UserTasks: 自分のタスクのみ読み書き可能
    match /UserTasks/{taskId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == get(/databases/$(database)/documents/UserProjects/$(resource.data.userProjectId)).data.userId;
    }
    
    // CommunityActivity: 読み取り全員、書き込み認証ユーザー
    match /CommunityActivity/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Likes: 読み取り全員、書き込み認証ユーザー
    match /Likes/{likeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // CertificationTemplates: 全員読み取り可能
    match /CertificationTemplates/{templateId} {
      allow read: if request.auth != null;
    }
    
    // TemplateTasks: 全員読み取り可能
    match /TemplateTasks/{taskId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 5. エラーハンドリング

### 5.1 HTTPステータスコード
- `200 OK`: 成功
- `201 Created`: 作成成功
- `400 Bad Request`: リクエスト形式エラー
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 権限エラー
- `404 Not Found`: リソースが見つからない
- `409 Conflict`: データ競合
- `500 Internal Server Error`: サーバーエラー

### 5.2 エラーレスポンス例
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値に問題があります",
    "details": "displayName は3文字以上20文字以下で入力してください",
    "field": "displayName"
  },
  "timestamp": "2025-01-15T10:00:00Z",
  "requestId": "req_789012"
}
```

## 6. パフォーマンス最適化

### 6.1 キャッシュ戦略
- **Static Data**: 資格テンプレート（1時間キャッシュ）
- **User Data**: ユーザープロジェクト（リアルタイム更新）
- **Community Data**: コミュニティ活動（5分キャッシュ）

### 6.2 ページネーション
```json
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "cursor_abc123",
    "totalCount": 150,
    "page": 1,
    "limit": 20
  }
}
```

## 7. レート制限
- **認証済みユーザー**: 1000 requests/hour
- **未認証アクセス**: 100 requests/hour
- **特定エンドポイント**: POST /likes は 60 requests/hour

---

この API仕様書により、CertPath アプリケーションのバックエンド設計が完了します。
次の工程では、この API を使用する画面設計を行います。