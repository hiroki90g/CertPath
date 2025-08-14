'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@/components/ui'

interface Project {
  id: string
  project_name: string
  target_date: string | null
  status: string
  progress_percentage: number
  studied_hours: number
  created_at: string
  certification: {
    name: string
    description: string
    category: string
    difficulty_level: string
    estimated_period: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProject()
  }, [user, projectId, router])

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          certification:certifications(
            name,
            description,
            category,
            difficulty_level,
            estimated_period
          )
        `)
        .eq('id', projectId)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      setProject(data)
    } catch (err: any) {
      console.error('プロジェクト情報の取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">プロジェクトが見つかりません</h1>
          <p className="text-red-600 mb-4">{error || 'プロジェクトが存在しないか、アクセス権限がありません'}</p>
          <Button onClick={() => router.push('/projects')}>
            プロジェクト一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const daysUntilTarget = getDaysUntilTarget(project.target_date)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{project.project_name}</h1>
            <div className="flex items-center gap-4">
              {getStatusBadge(project.status)}
              <span className="text-muted-foreground">
                作成日: {formatDate(project.created_at)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">編集</Button>
            <Button>タスクを追加</Button>
          </div>
        </div>

        {/* 資格情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">対象資格</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{project.certification.name}</h3>
                <Badge variant="outline">{project.certification.difficulty_level}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.certification.description}</p>
              <div className="flex gap-4 text-sm">
                <span>カテゴリ: {project.certification.category}</span>
                <span>推定期間: {project.certification.estimated_period}日</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 進捗状況 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">学習進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進捗率</span>
                  <span>{project.progress_percentage}%</span>
                </div>
                <Progress value={project.progress_percentage} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">学習時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.studied_hours}時間</div>
              <p className="text-sm text-muted-foreground">累計学習時間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">目標まで</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {daysUntilTarget !== null ? (
                  daysUntilTarget > 0 ? `${daysUntilTarget}日` : daysUntilTarget === 0 ? '今日' : '期限超過'
                ) : '未設定'}
              </div>
              <p className="text-sm text-muted-foreground">
                目標日: {formatDate(project.target_date)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* タスク一覧エリア（今後実装） */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">タスク一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>タスクがまだありません</p>
              <Button className="mt-4">最初のタスクを作成</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}