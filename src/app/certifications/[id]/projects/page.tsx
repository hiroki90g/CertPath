'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProjects, type Project } from '@/hooks/useProjects'
import { usePublicTasks } from '@/hooks/usePublicTasks'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress, Input } from '@/components/ui'

export default function PublicProjectsPage() {
  const params = useParams()
  const certificationId = params.id as string

  // 状態管理
  const [publicProjects, setPublicProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [hitMessage, setHitMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { fetchPublicProjectsByCertification } = useProjects()
  const { tasks, loading: tasksLoading } = usePublicTasks(selectedProject?.id || '')
  
  useEffect(() =>{
    fetchPublicProjects()
  }, [certificationId])
  // プロジェクト一覧を取得
  const fetchPublicProjects = async () => {
    try {
      setLoading(true)
      const data = await fetchPublicProjectsByCertification(certificationId)
      if( data.length === 0 ) {
        setHitMessage('プロジェクトが見つかりませんでした')
        return
      }
      setPublicProjects(data)
    } catch (err: any) {
      console.error('公開プロジェクトの取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">公開プロジェクト一覧</h1>
          <p className="text-muted-foreground">
            他の学習者のプロジェクトを参考にしよう
          </p>
        </div>

        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-600">エラー:{error}</div>}
        {hitMessage && <div className="text-center py-8">{hitMessage}</div>}

        {!loading && !error && publicProjects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                プロジェクト  ({publicProjects.length}件)
              </h2>
              {publicProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedProject(project)}
                >
                  <CardHeader>
                    <CardTitle>{project.project_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(project.progress_percentage)} className="mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                プロジェクト詳細
              </h2>
              {selectedProject ? (
                <div className="space-y-4">
                  {/* プロジェクト基本情報 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedProject.project_name}</CardTitle>
                      <Badge className="bg-blue-500 text-white w-fit">
                        {selectedProject.certification?.name || '未設定'}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>進捗: {selectedProject.progress_percentage}%</div>
                        <div>作成者: {selectedProject.user?.display_name || '匿名'}</div>
                        <div>タスク数: {selectedProject.completed_tasks || 0} / {selectedProject.total_tasks || 0}</div>
                        <div>学習時間: {selectedProject.studied_hours}時間</div>
                      </div>
                      <Progress value={selectedProject.progress_percentage} className="mt-3" />
                    </CardContent>
                  </Card>

                  {/* タスク一覧 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">タスク一覧</h4>
                    {tasksLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="text-center text-gray-500 py-6">
                        タスクがまだ登録されていません
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {tasks.map((task) => (
                          <Card key={task.id} className={`${task.is_completed ? 'bg-gray-50' : ''}`}>
                            <CardContent className="py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  task.is_completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300'
                                }`}>
                                  {task.is_completed && '✓'}
                                </div>
                                <div className="flex-1">
                                  <h5 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                  </h5>
                                  {task.description && (
                                    <p className={`text-sm ${task.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    予想時間: {task.estimated_hours}時間
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">プロジェクトを選択してください</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

}