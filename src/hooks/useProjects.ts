import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Project {
  id: string
  user_id: string
  certification_id: string
  project_name: string
  target_date: string | null
  status: 'active' | 'pending' | 'done'
  progress_percentage: number
  total_tasks: number | null
  completed_tasks: number | null
  total_estimated_hours: number | null
  studied_hours: number
  created_at: string
  updated_at: string
  certification?: {
    id: string
    name: string
    description: string
    category: string
    difficulty_level: string
    estimated_period: number
  }
}

export interface CreateProjectData {
  certification_id: string
  project_name: string
  target_date?: string | null
}

export interface UpdateProjectData {
  project_name?: string
  target_date?: string | null
  status?: 'active' | 'pending' | 'done'
  progress_percentage?: number
  total_tasks?: number | null
  completed_tasks?: number | null
  total_estimated_hours?: number | null
  studied_hours?: number
}

export const useProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // プロジェクト一覧を取得
  const fetchProjects = async () => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          certification:certifications(
            id,
            name,
            description,
            category,
            difficulty_level,
            estimated_period
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProjects(data || [])
    } catch (err: any) {
      console.error('プロジェクト一覧の取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 特定のプロジェクトを取得
  const fetchProject = async (projectId: string): Promise<Project | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          certification:certifications(
            id,
            name,
            description,
            category,
            difficulty_level,
            estimated_period
          )
        `)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return data
    } catch (err: any) {
      console.error('プロジェクトの取得に失敗:', err)
      throw err
    }
  }

  // プロジェクトを作成
  const createProject = async (data: CreateProjectData): Promise<Project> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      // デバッグ用ログ
      console.log('Creating project with user.id:', user.id)
      console.log('Certification ID:', data.certification_id)
      
      const insertData = {
        user_id: user.id,
        certification_id: data.certification_id,
        project_name: data.project_name.trim(),
        target_date: data.target_date ? new Date(data.target_date).toISOString() : null,
        status: 'active',
        progress_percentage: 0,
        studied_hours: 0
      }
      
      console.log('Insert data:', insertData)

      const { data: project, error } = await supabase
        .from('projects')
        .insert(insertData)
        .select(`
          *,
          certification:certifications(
            id,
            name,
            description,
            category,
            difficulty_level,
            estimated_period
          )
        `)
        .single()

      if (error) throw error

      // プロジェクト一覧を更新
      setProjects(prev => [project, ...prev])

      return project
    } catch (err: any) {
      console.error('プロジェクトの作成に失敗:', err)
      throw err
    }
  }

  // プロジェクトを更新
  const updateProject = async (projectId: string, data: UpdateProjectData): Promise<Project> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const updateData: any = { ...data }
      
      // target_dateが文字列の場合はISO文字列に変換
      if (updateData.target_date) {
        updateData.target_date = new Date(updateData.target_date).toISOString()
      }

      const { data: project, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select(`
          *,
          certification:certifications(
            id,
            name,
            description,
            category,
            difficulty_level,
            estimated_period
          )
        `)
        .single()

      if (error) throw error

      // プロジェクト一覧を更新
      setProjects(prev => 
        prev.map(p => p.id === projectId ? project : p)
      )

      return project
    } catch (err: any) {
      console.error('プロジェクトの更新に失敗:', err)
      throw err
    }
  }

  // プロジェクトを削除
  const deleteProject = async (projectId: string): Promise<void> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      // プロジェクト一覧から削除
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err: any) {
      console.error('プロジェクトの削除に失敗:', err)
      throw err
    }
  }

  // 進捗を更新（タスクの完了/未完了に応じて）
  const updateProjectProgress = async (projectId: string): Promise<void> => {
    if (!user) return

    try {
      // そのプロジェクトのタスク数と完了タスク数を取得
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, is_completed')
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (tasksError) throw tasksError

      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter(task => task.is_completed).length || 0
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      // プロジェクトの進捗を更新
      await updateProject(projectId, {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        progress_percentage: progressPercentage
      })
    } catch (err: any) {
      console.error('進捗の更新に失敗:', err)
    }
  }

  // 初回ロード時にプロジェクト一覧を取得
  useEffect(() => {
    fetchProjects()
  }, [user])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectProgress,
    refetch: fetchProjects
  }
}