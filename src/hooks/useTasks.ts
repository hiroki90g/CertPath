import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Task {
  id: string
  user_id: string
  project_id: string
  title: string
  description: string | null
  estimated_hours: number
  is_completed: boolean
  is_public: boolean
  completed_at: string | null
  copy_count: number
  original_task_id: string | null
  order_index: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  project_id: string
  title: string
  description?: string | null
  estimated_hours: number
  order_index?: number
  notes?: string | null
}

export interface UpdateTaskData {
  title?: string
  description?: string | null
  estimated_hours?: number
  is_completed?: boolean
  is_public?: boolean
  order_index?: number
  notes?: string | null
}

export const useTasks = (projectId?: string) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // タスク一覧を取得
  const fetchTasks = async (targetProjectId?: string) => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true })

      // プロジェクトIDが指定されている場合はフィルタ
      const filterProjectId = targetProjectId || projectId
      if (filterProjectId) {
        query = query.eq('project_id', filterProjectId)
      }

      const { data, error } = await query

      if (error) throw error

      setTasks(data || [])
    } catch (err: any) {
      console.error('タスク一覧の取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 特定のタスクを取得
  const fetchTask = async (taskId: string): Promise<Task | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return data
    } catch (err: any) {
      console.error('タスクの取得に失敗:', err)
      throw err
    }
  }

  // タスクを作成
  const createTask = async (data: CreateTaskData): Promise<Task> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      // order_indexが指定されていない場合は最後に追加
      let orderIndex = data.order_index
      if (orderIndex === undefined) {
        const { data: lastTask } = await supabase
          .from('tasks')
          .select('order_index')
          .eq('project_id', data.project_id)
          .eq('user_id', user.id)
          .order('order_index', { ascending: false })
          .limit(1)
          .single()

        orderIndex = (lastTask?.order_index || 0) + 1
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          project_id: data.project_id,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          estimated_hours: data.estimated_hours,
          order_index: orderIndex,
          notes: data.notes?.trim() || null,
          is_completed: false,
          is_public: false
        })
        .select()
        .single()

      if (error) throw error

      // タスク一覧を更新
      setTasks(prev => [...prev, task].sort((a, b) => a.order_index - b.order_index))

      return task
    } catch (err: any) {
      console.error('タスクの作成に失敗:', err)
      throw err
    }
  }

  // タスクを更新
  const updateTask = async (taskId: string, data: UpdateTaskData): Promise<Task> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const updateData: any = { ...data }

      // タスクが完了になった場合、completed_atを設定
      if (data.is_completed === true) {
        const existingTask = tasks.find(t => t.id === taskId)
        if (existingTask && !existingTask.is_completed) {
          updateData.completed_at = new Date().toISOString()
        }
      }
      // タスクが未完了になった場合、completed_atとis_publicをクリア
      else if (data.is_completed === false) {
        updateData.completed_at = null
        updateData.is_public = false
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // タスク一覧を更新
      setTasks(prev => 
        prev.map(t => t.id === taskId ? task : t)
      )

      return task
    } catch (err: any) {
      console.error('タスクの更新に失敗:', err)
      throw err
    }
  }

  // タスクを削除
  const deleteTask = async (taskId: string): Promise<void> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id)

      if (error) throw error

      // タスク一覧から削除
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err: any) {
      console.error('タスクの削除に失敗:', err)
      throw err
    }
  }

  // タスクの完了状態を切り替え
  const toggleTaskCompletion = async (taskId: string): Promise<Task> => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) throw new Error('タスクが見つかりません')

    return updateTask(taskId, {
      is_completed: !task.is_completed
    })
  }

  // タスクの公開状態を切り替え（完了済みタスクのみ）
  const toggleTaskPublic = async (taskId: string): Promise<Task> => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) throw new Error('タスクが見つかりません')
    if (!task.is_completed) throw new Error('完了済みタスクのみ公開できます')

    return updateTask(taskId, {
      is_public: !task.is_public
    })
  }

  // タスクの順序を更新
  const reorderTasks = async (reorderedTasks: Task[]): Promise<void> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      // バッチでorder_indexを更新
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_index: index
      }))

      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('user_id', user.id)
      }

      // ローカル状態を更新
      setTasks(reorderedTasks)
    } catch (err: any) {
      console.error('タスクの順序更新に失敗:', err)
      throw err
    }
  }

  // 初回ロード時にタスク一覧を取得
  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId)
    }
  }, [user, projectId])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskPublic,
    reorderTasks,
    refetch: () => fetchTasks(projectId)
  }
}