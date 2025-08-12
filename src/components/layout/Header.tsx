'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">CertPath</span>
          </Link>
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
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">新規登録</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}