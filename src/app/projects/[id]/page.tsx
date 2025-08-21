'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress, Input } from '@/components/ui'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useAuth()
  const projectId = params.id as string

  const { fetchProject, updateProject, updateProjectProgress } = useProjects()
  const { tasks, createTask, updateTask, deleteTask, toggleTaskCompletion, loading: tasksLoading } = useTasks(projectId)
  
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    estimated_hours: 1
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    project_name:'',
    target_date: null as string | null,
    status: 'active',
    is_public: false
  })

  useEffect(() => {
    // まだユーザー状態をロード中の場合は待つ
    if (userLoading) {
      console.log('User loading:', userLoading, 'User:', user)
      return
    }
    
    if (!user) {
      console.log('No user, redirecting to login')
      router.push('/login')
      return
    }

    loadProject()
  }, [user, userLoading, projectId, router])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await fetchProject(projectId)
      if (!data) {
        setError('プロジェクトが見つかりません')
        return
      }
      setProject(data)
      setEditForm({
        project_name: data.project_name,
        target_date: data.target_date || null,
        status: data.status || 'active',
        is_public: data.is_public || false
      })
    } catch (err: any) {
      console.error('プロジェクト情報の取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTask.title.trim() || isCreatingTask) return

    try {
      setIsCreatingTask(true)
      await createTask({
        project_id: projectId,
        title: newTask.title,
        description: newTask.description || null,
        estimated_hours: newTask.estimated_hours
      })
      
      setNewTask({ title: '', description: '', estimated_hours: 1 })
      setShowTaskForm(false)
      
      // 進捗率を更新
      await updateProjectProgress(projectId)
      await loadProject() // プロジェクト情報を再読み込み
      alert(`タスクを作成しました`)
    } catch (err: any) {
      alert(`タスクの作成に失敗しました: ${err.message}`)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId)
      
      // 進捗率を更新
      await updateProjectProgress(projectId)
      await loadProject() // プロジェクト情報を再読み込み
    } catch (err: any) {
      alert(`タスクの更新に失敗しました: ${err.message}`)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('このタスクを削除しますか？')) return
    
    try {
      await deleteTask(taskId)
      
      // 進捗率を更新
      await updateProjectProgress(projectId)
      await loadProject() // プロジェクト情報を再読み込み
    } catch (err: any) {
      alert(`タスクの削除に失敗しました: ${err.message}`)
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      project_name: project.project_name || '',
      target_date: project.target_date || null,
      status: project.status || 'active',
      is_public: project.is_public || false
    })
  }

  const handleSaveEdit = async () => {
    try {
      await updateProject(projectId, editForm)
      setIsEditing(false)
      await loadProject() // プロジェクト情報を再読み込み
      alert('プロジェクト情報を更新しました')
    } catch (err: any) {
      alert(`プロジェクトの更新に失敗しました: ${err.message}`)
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


  // ユーザー状態のロード中
  if (userLoading) {
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
  
  // リアルタイムのタスク統計計算
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.is_completed).length
  const realTimeProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            { isEditing ? (
              <Input 
                value={editForm.project_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, project_name: e.target.value }))}
                className="text-3xl font-bold border-2 border-blue-300"
                placeholder="プロジェクト名を入力"
              />
              ) : (
                <h1 className="text-3xl font-bold">{project.project_name}</h1>
              )}
              {isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={editForm.is_public}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_public" className="text-sm font-medium">
                    このプロジェクトを公開する
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {editForm.is_public ? '(他の人に表示されます)' : '(自分のみ表示)'}
                  </span>
                </div>
              )}
            <div className="flex items-center gap-4">
              {getStatusBadge(project.status)}
              <span className="text-muted-foreground">
                作成日: {formatDate(project.created_at)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSaveEdit}>保存</Button>
                <Button variant="outline" onClick={handleCancelEdit}>キャンセル</Button>
              </>
            ) : (
              <Button onClick={handleStartEdit}>編集</Button>
            )}
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
                <h3 className="font-medium">{project.certification?.name || '資格情報なし'}</h3>
                <Badge variant="outline">{project.certification?.difficulty_level || '-'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.certification?.description || ''}</p>
              <div className="flex gap-4 text-sm">
                <span>カテゴリ: {project.certification?.category || '-'}</span>
                <span>推定期間: {project.certification?.estimated_period || 0}日</span>
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
                  <span>{realTimeProgress}%</span>
                </div>
                <Progress value={realTimeProgress} className="w-full" />
                <div className="text-xs text-muted-foreground">
                  {completedTasks} / {totalTasks} タスク完了
                </div>
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
              <div className="text-xs text-muted-foreground mt-1">
                予想総時間: {totalEstimatedHours}時間
              </div>
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

        {/* タスク一覧 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">タスク一覧</CardTitle>
              <Button onClick={() => setShowTaskForm(true)}>
                タスクを追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* タスク作成フォーム */}
            {showTaskForm && (
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">タスク名 *</label>
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="例: 基本知識の復習"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">説明</label>
                      <Input
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="タスクの詳細説明（任意）"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">予想時間（時間）</label>
                      <select
                        value={newTask.estimated_hours}
                        onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) }))}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCreatingTask}>
                        {isCreatingTask ? '作成中...' : '作成'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowTaskForm(false)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* タスクリスト */}
            {tasksLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>タスクがまだありません</p>
                <p className="text-sm mt-2">「タスクを追加」ボタンから最初のタスクを作成しましょう</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card key={task.id} className={`${task.is_completed ? 'bg-gray-50' : ''}`}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className={`text-sm ${task.is_completed ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>{task.estimated_hours}時間</span>
                              {task.is_completed && task.completed_at && (
                                <span>完了: {formatDate(task.completed_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          削除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}