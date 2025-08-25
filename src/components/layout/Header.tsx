'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { useAuthContext } from '@/contexts/AuthContext'

export function Header() {
  const { user, loading, signOut } = useAuthContext()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error: any) {
      console.error('ログアウトエラー:', error)
      alert(`ログアウトに失敗しました: ${error.message}`)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">CertPath</span>
          </Link>
          {user && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/certifications"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                資格一覧
              </Link>
              <Link
                href="/projects"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                マイプロジェクト
              </Link>
              <Link
                href="/community"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                コミュニティ
              </Link>
              <Link
                href="/profile"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                プロファイル
              </Link>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">{user.displayName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">ログイン</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">新規登録</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}