import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from '@/components/ui'

export default function CommunityPage() {
  const activities = [
    {
      id: 1,
      userId: 'user123',
      username: 'りょう',
      certification: '基本情報技術者試験',
      taskTitle: 'アルゴリズムとプログラミングの学習',
      message: 'ソートアルゴリズムの理解が深まりました！',
      progressPercentage: 72,
      likesCount: 3,
      createdAt: '2025-01-15T10:30:00Z',
    },
    {
      id: 2,
      userId: 'user456',
      username: 'あかり',
      certification: 'ITパスポート',
      taskTitle: null,
      message: '今日から学習開始！みなさんよろしくお願いします🔥',
      progressPercentage: 5,
      likesCount: 8,
      createdAt: '2025-01-15T09:15:00Z',
    },
    {
      id: 3,
      userId: 'user789',
      username: 'けんた',
      certification: '応用情報技術者試験',
      taskTitle: 'データベース設計の学習',
      message: '正規化の概念がやっと理解できました。次はSQL実践です！',
      progressPercentage: 45,
      likesCount: 5,
      createdAt: '2025-01-15T08:45:00Z',
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      return '今'
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}日前`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">コミュニティ</h1>
          <p className="text-muted-foreground">
            同じ目標を持つ仲間と一緒に学習を進めましょう
          </p>
        </div>

        {/* アクティビティフィード */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">最新のアクティビティ</h2>
          
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {activity.username.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.username}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.certification}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {activity.taskTitle && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">完了したタスク</p>
                    <p className="text-sm">{activity.taskTitle}</p>
                  </div>
                )}
                
                <p>{activity.message}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>現在の進捗</span>
                    <span className="font-medium">{activity.progressPercentage}%</span>
                  </div>
                  <Progress value={activity.progressPercentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm">
                    👍 いいね {activity.likesCount > 0 && `(${activity.likesCount})`}
                  </Button>
                  <Button variant="ghost" size="sm">
                    応援メッセージを送る
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 同じ資格挑戦者 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">同じ資格を目指している仲間</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['基本情報技術者試験', 'ITパスポート', '応用情報技術者試験'].map((cert) => (
              <Card key={cert}>
                <CardHeader>
                  <CardTitle className="text-lg">{cert}</CardTitle>
                  <CardDescription>挑戦中: 12人</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    仲間を見る
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}