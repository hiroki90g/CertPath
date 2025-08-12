import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Progress, Badge } from '@/components/ui'

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: '基本情報技術者 2025年春試験',
      certification: '基本情報技術者試験',
      status: 'active',
      progressPercentage: 65,
      completedTasks: 16,
      totalTasks: 25,
      targetDate: '2025-04-20',
      studiedHours: 80,
    },
    {
      id: 2,
      name: 'ITパスポート取得計画',
      certification: 'ITパスポート',
      status: 'pending',
      progressPercentage: 0,
      completedTasks: 0,
      totalTasks: 15,
      targetDate: '2025-06-15',
      studiedHours: 0,
    },
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'completed': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '進行中'
      case 'pending': return '準備中'
      case 'completed': return '完了'
      default: return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">マイプロジェクト</h1>
            <p className="text-muted-foreground">
              進行中の学習プロジェクトを管理しましょう
            </p>
          </div>
          <Button>
            新しいプロジェクトを作成
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium mb-2">まだプロジェクトがありません</h3>
              <p className="text-muted-foreground mb-4">
                資格を選択してプロジェクトを作成しましょう
              </p>
              <Button>
                プロジェクトを作成する
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <Badge variant={getStatusVariant(project.status) as any}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                  <CardDescription>{project.certification}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>進捗率</span>
                      <span className="font-medium">{project.progressPercentage}%</span>
                    </div>
                    <Progress value={project.progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">完了タスク:</span>
                      <br />
                      {project.completedTasks}/{project.totalTasks}
                    </div>
                    <div>
                      <span className="font-medium">学習時間:</span>
                      <br />
                      {project.studiedHours}時間
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">目標試験日:</span> {project.targetDate}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      プロジェクトを開く
                    </Button>
                    <Button variant="outline">
                      編集
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}