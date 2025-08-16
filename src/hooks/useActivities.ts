'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Activity{
  id: string
  user_id: string
  project_id: string
  completed_task_title: string | null
  message: string | null
  likes_count: number
  created_at: string
  is_liked?: boolean // 現在のユーザーがいいねしてるかどうか
  user?: {
      display_name: string
      profile_image: string
  }
  project?: {
      project_name: string
  }
}

export interface CreateActivityData{
  user_id: string
  project_id: string
  completed_task_title: string | null
  message: string | null
}

export const useActivities = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async (userId?: string) => {
    if(!user){
      setActivities([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
    
    const targetUserId = userId || user.id
    console.log('Fetching activities for user:', targetUserId)

    let query = supabase 
      .from('activities')
      .select(`
        *,
        user:users(display_name, profile_image),
        project:projects(project_name)
        `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false})
    
    const { data, error } = await query

    if (error) throw error

    // 各アクティビティに対して現在のユーザーがいいねしてるかチェック
    const activitiesWithLikeStatus = await Promise.all(
      (data || []).map(async (activity) => {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('activity_id', activity.id)
          .eq('user_id', user.id)
          .single()

        return {
          ...activity,
          is_liked: !!likeData
        }
      })
    )

    setActivities(activitiesWithLikeStatus)
    } catch (err: any) {
      console.error('活動一覧の取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
    console.log('Activities fetched:', activities)
  }

  const createActivity = async (data: CreateActivityData): Promise<Activity> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const {data: activity, error} = await supabase
        .from('activities')
        .insert({
          user_id: data.user_id,
          project_id: data.project_id,
          completed_task_title: data.completed_task_title,
          message: data.message
        })
        .select()
        .single()

      if (error) throw error

      setActivities(prev => [activity, ...prev])

      return activity
    }catch (err: any){
      console.error('活動の投稿に失敗しました:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [user])

  // いいね機能
  const toggleLike = async (activityId: string): Promise<void> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      // 現在のいいね状態を確認
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingLike) {
        // いいねを削除
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        if (deleteError) throw deleteError

        // activitiesのlikes_countを減らす
        const { error: updateError } = await supabase
          .from('activities')
          .update({ 
            likes_count: activities.find(a => a.id === activityId)!.likes_count - 1 
          })
          .eq('id', activityId)

        if (updateError) throw updateError

      } else {
        // いいねを追加
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            activity_id: activityId,
            user_id: user.id
          })

        if (insertError) throw insertError

        // activitiesのlikes_countを増やす
        const { error: updateError } = await supabase
          .from('activities')
          .update({ 
            likes_count: activities.find(a => a.id === activityId)!.likes_count + 1 
          })
          .eq('id', activityId)

        if (updateError) throw updateError
      }

      // 画面を更新
      await fetchActivities()

    } catch (err: any) {
      console.error('いいね処理に失敗:', err)
      throw err
    }
  }

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
    toggleLike
  }
}

