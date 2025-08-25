import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pb-16">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            IT資格取得を
            <br />
            <span className="text-primary">効率的にサポート</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 text-xl">
            タスク設計の効率化からコミュニティ支援まで。
            2-3分で学習計画を立て、仲間と一緒にモチベーションを維持しながら資格取得を目指しましょう。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/certifications">資格を選択して始める</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">ログインして続きから</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">タスク設計の効率化</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              2-3分で学習計画を立てられる効率的なタスク管理システム
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">実証済み学習パス</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              先人の成功事例をベースにした信頼性の高いタスクリスト
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">コミュニティ支援</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              同じ資格を目指す仲間との進捗共有とリアルタイム更新
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">継続支援</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              孤独感の解消と相互励まし機能でモチベーションを維持
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-muted rounded-lg">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">今すぐ始めてみませんか？</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            無料でアカウントを作成して、効率的な資格学習を体験してください
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">無料で始める</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}