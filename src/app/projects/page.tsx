'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@/components/ui'

export default function ProjectsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { projects, loading, error, refetch } = useProjects()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">進行中</Badge>
      case 'pending': return <Badge variant="secondary">保留</Badge>
      case 'done': return <Badge variant="destructive">完了</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getDaysUntilTarget = (targetDate: string | null) => {
    if (!targetDate) return null
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch}>
            再読み込み
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">プロジェクト一覧</h1>
            <p className="text-muted-foreground">
              学習プロジェクトを管理しましょう ({projects.length}件)
            </p>
          </div>
          <Button onClick={() => router.push('/certifications')}>
            新しいプロジェクトを作成
          </Button>
        </div>

        {/* プロジェクト一覧 */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">プロジェクトがありません</h3>
              <p className="text-muted-foreground mb-4">
                資格を選択してプロジェクトを作成しましょう
              </p>
              <Button onClick={() => router.push('/certifications')}>
                資格一覧を見る
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const daysUntilTarget = getDaysUntilTarget(project.target_date)
              
              return (
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl truncate">{project.project_name}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{project.certification?.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.certification?.difficulty_level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {project.certification?.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 進捗 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>進捗</span>
                        <span>{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="w-full" />
                    </div>

                    {/* 統計 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">学習時間:</span>
                        <br />
                        {project.studied_hours}時間
                      </div>
                      <div>
                        <span className="font-medium">目標まで:</span>
                        <br />
                        {daysUntilTarget !== null ? (
                          daysUntilTarget > 0 ? `${daysUntilTarget}日` : 
                          daysUntilTarget === 0 ? '今日' : 
                          <span className="text-red-600">期限超過</span>
                        ) : '未設定'}
                      </div>
                    </div>

                    {/* 日付情報 */}
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <div>目標日: {formatDate(project.target_date)}</div>
                      <div>作成日: {formatDate(project.created_at)}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}