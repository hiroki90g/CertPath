  import { useState, useEffect } from 'react'
  import { supabase } from '@/lib/supabase'

  export interface PublicTask {
    id: string
    project_id: string
    title: string
    description: string | null
    estimated_hours: number
    is_completed: boolean
    completed_at: string | null
    order_index: number
    created_at: string
  }

  export const usePublicTasks = (projectId?: string) => {
    const [tasks, setTasks] = useState<PublicTask[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTasks = async () => {
      if (!projectId) {
        setTasks([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select('id, project_id, title, description, estimated_hours, is_completed, completed_at, order_index, created_at')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        setTasks(data || [])
      } catch (err: any) {
        console.error('公開タスクの取得に失敗:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      fetchTasks()
    }, [projectId])

    return {
      tasks,
      loading,
      error,
      refetch: fetchTasks
    }
  }
