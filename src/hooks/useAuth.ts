'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string // usersテーブルのid
  authId: string // Supabase AuthのID
  email: string
  displayName: string
  avatarUrl?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期認証状態を取得
    const getInitialAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const mappedUser = await mapUser(user)
        setUser(mappedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    getInitialAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          const mappedUser = await mapUser(session.user)
          setUser(mappedUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}

async function mapUser(user: User): Promise<AuthUser> {
  // usersテーブルからユーザー情報を取得
  let { data: userData, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  // ユーザーが存在しない場合は新規作成
  if (error || !userData) {
    console.log('ユーザーが見つからないため新規作成します:', user.id)
    
    const displayName = user.user_metadata?.full_name || user.email!.split('@')[0]
    
    const { data: newUserData, error: createError } = await supabase
      .from('users')
      .insert({
        auth_user_id: user.id,
        email: user.email!,
        display_name: displayName,
        avatar_url: user.user_metadata?.avatar_url,
      })
      .select('id')
      .single()

    if (createError) {
      console.error('ユーザー作成エラー:', createError)
      throw new Error(`ユーザーの作成に失敗しました: ${createError.message}`)
    }

    userData = newUserData
  }

  return {
    id: userData.id, // usersテーブルのid
    authId: user.id, // Supabase AuthのID
    email: user.email!,
    displayName: user.user_metadata?.full_name || user.email!.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url,
  }
}