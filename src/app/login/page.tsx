'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuthContext()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()

  // ログイン済みの場合はリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.push('/projects')
    }
  }, [user, loading, router])

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle()
    } catch (error: any) {
      console.error('ログインエラー:', error)
      alert(`ログインに失敗しました: ${error.message}`)
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>リダイレクト中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            CertPath にログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            IT資格学習を効率的に進めましょう
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>アカウントでログイン</CardTitle>
            <CardDescription>
              Googleアカウントを使用して簡単にログインできます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="w-full"
              size="lg"
            >
              {isSigningIn ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>ログイン中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Googleでログイン</span>
                </div>
              )}
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>
                アカウントをお持ちでない場合は、
                <br />
                ログイン時に自動的に作成されます
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-primary hover:underline"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}