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
  const { data: userData, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !userData) {
    throw new Error('ユーザー情報が見つかりません')
  }

  return {
    id: userData.id, // usersテーブルのid
    authId: user.id, // Supabase AuthのID
    email: user.email!,
    displayName: user.user_metadata?.full_name || user.email!.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url,
  }
}