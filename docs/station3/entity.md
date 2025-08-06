# CertPath ER図設計書

## エンティティ一覧と関係性

### 1. Users（ユーザー）
**属性：**
- uid (PK) - string
- displayName - string
- email - string
- targetCertification - string
- startDate - timestamp
- isProgressPublic - boolean
- createdAt - timestamp
- updatedAt - timestamp

### 2. CertificationTemplates（資格テンプレート）
**属性：**
- id (PK) - string
- name - string
- description - text
- category - string
- estimatedPeriod - number
- difficultyLevel - string
- createdAt - timestamp
- isActive - boolean

### 3. TemplateTasks（テンプレートタスク）
**属性：**
- id (PK) - string
- certificationId (FK) - string
- title - string
- description - text
- estimatedHours - number
- priority - number
- orderIndex - number
- referenceLinks - array
- createdAt - timestamp

### 4. UserProjects（ユーザープロジェクト）
**属性：**
- id (PK) - string
- userId (FK) - string
- certificationId (FK) - string
- projectName - string
- targetDate - date
- status - string (active/completed/paused)
- progressPercentage - number
- createdAt - timestamp
- updatedAt - timestamp

### 5. UserTasks（ユーザータスク）
**属性：**
- id (PK) - string
- userProjectId (FK) - string
- templateTaskId (FK) - string (nullable)
- title - string
- description - text
- estimatedHours - number
- isCompleted - boolean
- completedAt - timestamp
- orderIndex - number
- isCustomTask - boolean
- createdAt - timestamp
- updatedAt - timestamp

### 6. CommunityActivity（コミュニティ活動）
**属性：**
- id (PK) - string
- userId (FK) - string
- userProjectId (FK) - string
- activityType - string (progress_update/task_completed/project_completed)
- message - string
- progressPercentage - number
- createdAt - timestamp

### 7. Likes（いいね）
**属性：**
- id (PK) - string
- userId (FK) - string
- targetUserId (FK) - string
- activityId (FK) - string
- likeType - string (like/cheer)
- createdAt - timestamp

## エンティティ間の関係性

### 1対多の関係
1. **Users → UserProjects** (1:N)
   - 1人のユーザーは複数のプロジェクトを持てる

2. **CertificationTemplates → UserProjects** (1:N)
   - 1つの資格テンプレートから複数のユーザープロジェクトが作成される

3. **CertificationTemplates → TemplateTasks** (1:N)
   - 1つの資格テンプレートは複数のタスクを持つ

4. **UserProjects → UserTasks** (1:N)
   - 1つのユーザープロジェクトは複数のタスクを持つ

5. **Users → CommunityActivity** (1:N)
   - 1人のユーザーは複数のアクティビティを投稿する

6. **UserProjects → CommunityActivity** (1:N)
   - 1つのプロジェクトから複数のアクティビティが発生する

7. **Users → Likes** (1:N)
   - 1人のユーザーは複数のいいねを送る

8. **Users → Likes (target)** (1:N)
   - 1人のユーザーは複数のいいねを受け取る

9. **CommunityActivity → Likes** (1:N)
   - 1つのアクティビティは複数のいいねを受ける

### 多対多の関係
**TemplateTasks ↔ UserTasks** (N:N)
- テンプレートタスクは複数のユーザータスクの元になる
- ユーザータスクはテンプレートタスクを参照する（カスタムタスクの場合はnull）

## Figmaでの作成ガイド

### 1. 準備
- Figmaで新しいファイル作成
- タイトル：「CertPath - ER図」
- ページサイズ：A3横向き推奨

### 2. エンティティボックスの作成
**各エンティティの表現方法：**
```
┌─────────────────────────┐
│ Users                   │
├─────────────────────────┤
│ PK: uid                 │
│     displayName         │
│     email               │
│     targetCertification │
│     startDate           │
│     isProgressPublic    │
│     createdAt           │
│     updatedAt           │
└─────────────────────────┘
```

### 3. リレーションシップライン
- **実線**: 強い関係（必須）
- **点線**: 弱い関係（オプション）
- **カラス足**: 多対多の関係

### 4. 色分け
- **コアエンティティ**: 青系（Users, UserProjects, UserTasks）
- **テンプレート系**: 緑系（CertificationTemplates, TemplateTasks）
- **コミュニティ系**: オレンジ系（CommunityActivity, Likes）

### 5. レイアウト推奨配置
```
CertificationTemplates ─── TemplateTasks
       │                        │
       │                        │
       ▼                        ▼
Users ─── UserProjects ─── UserTasks
  │           │
  │           │
  ▼           ▼
Likes ─── CommunityActivity
```

## 注意点

### データ整合性
1. **カスケード削除**: ユーザー削除時の関連データ処理
2. **参照整合性**: 外部キーの適切な設定
3. **NULL許可**: templateTaskIdはカスタムタスクの場合NULL

### パフォーマンス考慮
1. **インデックス**: よく検索される列にインデックス設定
2. **非正規化**: progressPercentageは計算値だが、パフォーマンスのため保存

### 将来拡張性
1. **ソフトデリート**: isActiveやisDeletedフラグで論理削除
2. **バージョニング**: テンプレートの更新履歴管理
3. **国際化**: 多言語対応のための設計余地