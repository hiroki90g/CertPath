'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from '@/components/ui'
import { useActivities } from '@/hooks/useActivities'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'

export default function CommunityPage() {
  const { user} = useAuth()
  const { activities, loading, error, createActivity, toggleLike } = useActivities()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    completed_task_title: '',
    message: ''
  })
  const { projects } = useProjects()

  if (!user) {
    return <div>ログインしてください</div>
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div> 
  }
  if ( error ) {
    return <div className="container mx-auto px-4 py-8">エラーが発生しました: {error}</div>
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.project_id) {
      alert('プロジェクトを選択してください')
      return
    }

    try {
      await createActivity({
          user_id: user.id,
          project_id: formData.project_id,
          completed_task_title: formData.completed_task_title || null,
          message: formData.message || null
      })

      setFormData({ project_id: '', completed_task_title: '', message: '' })
      setShowForm(false)
      alert('活動を投稿しました')
    }catch (error: any) {
      console.error('活動の投稿に失敗:', error)
      alert('活動の投稿に失敗しました: ' + error.message)
    }
  }

  const handleLike = async (activityId: string) => {
    try {
      await toggleLike(activityId)
    } catch (error: any) {
      console.error('いいね処理に失敗:', error)
      alert('いいね処理に失敗しました: ' + error.message)
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">最新のアクティビティ</h2>
          <Button onClick={() => setShowForm(true)}>
            活動を投稿
          </Button>
          {/* 投稿フォーム */}
          {showForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>活動を投稿</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">プロジェクト</label>
                    <select 
                      value={formData.project_id} 
                      onChange={(e) => setFormData(prev => ({...prev, project_id: e.target.value}))}
                      required
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="">プロジェクトを選択</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}> 
                          {project.project_name}
                        </option>
                      ))}
                    </select> 
                  </div>
                  <div>
                    <label className="text-sm font-medium">完了したタスク（任意）</label>
                    <input 
                      type="text" 
                      value={formData.completed_task_title} 
                      onChange={(e) => setFormData(prev => ({...prev, completed_task_title: e.target.value}))}
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">メッセージ（任意）</label>
                    <textarea 
                      value={formData.message} 
                      onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                      placeholder="今日の学習について書いてみましょう"
                      className="w-full mt-1 p-2 border rounded"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Button type="submit" className="w-full">
                      投稿する
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
           {activities.length === 0 ? (
                <div className="text-center py-8">
                  <p>まだ活動がありません</p>
                </div>
            ) : (
            <div>
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {activity.user?.profile_image ? (
                            <img 
                              src={activity.user.profile_image} 
                              alt="avatar" 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            activity.user?.display_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.user?.display_name || '名前なし'}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(activity.created_at)}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{activity.project?.project_name}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activity.completed_task_title && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">完了したタスク</p>
                        <p className="text-sm">{activity.completed_task_title}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>メッセージ</span>
                        <span className="font-medium">{activity.message}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLike(activity.id)}
                        className={activity.is_liked ? 'text-blue-600' : ''}
                      >
                        {activity.is_liked ? '👍' : '🤍'} いいね {activity.likes_count > 0 && `(${activity.likes_count})`}
                      </Button>
                      <Button variant="ghost" size="sm">
                        応援メッセージを送る
                      </Button>
                    </div>
                  </CardContent>
                </Card>              
              ))}
            </div>
          )}
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