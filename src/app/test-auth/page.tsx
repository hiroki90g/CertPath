'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { User } from '@supabase/supabase-js'

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 現在のユーザー情報を取得
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getCurrentUser()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/test-auth`,
        },
      })
      
      if (error) {
        console.error('ログインエラー:', error.message)
        alert(`ログインエラー: ${error.message}`)
      }
    } catch (error) {
      console.error('予期しないエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('ログアウトエラー:', error.message)
      }
    } catch (error) {
      console.error('予期しないエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">認証テスト</h1>
          <p className="text-muted-foreground">
            Google OAuth認証の動作確認
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>認証状態</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <span className="text-xl">✅</span>
                  <span className="font-medium">ログイン済み</span>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><strong>ユーザーID:</strong> {user.id}</p>
                  <p className="text-sm"><strong>メールアドレス:</strong> {user.email}</p>
                  <p className="text-sm">
                    <strong>表示名:</strong> {user.user_metadata?.full_name || 'なし'}
                  </p>
                  <p className="text-sm">
                    <strong>プロフィール画像:</strong> 
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full inline-block ml-2"
                      />
                    ) : 'なし'}
                  </p>
                  <p className="text-sm">
                    <strong>最終ログイン:</strong> {new Date(user.last_sign_in_at!).toLocaleString('ja-JP')}
                  </p>
                </div>

                <Button onClick={handleLogout} variant="outline">
                  ログアウト
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <span className="text-xl">❌</span>
                  <span className="font-medium">未ログイン</span>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={handleGoogleLogin} className="w-full">
                    Googleでログイン
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Google OAuth認証を使用してログインします
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {user && (
          <Card>
            <CardHeader>
              <CardTitle>次のステップ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>✅ Google OAuth認証成功</p>
                <p className="text-muted-foreground">次に以下を確認してください：</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>usersテーブルに自動でレコードが作成されているか</li>
                  <li>認証状態がアプリ全体で正しく管理されているか</li>
                  <li>ログイン・ログアウトUIコンポーネントの実装</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}