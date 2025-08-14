'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'

interface Certification {
  id: string
  name: string
  description: string
  category: string
  estimated_period: number
  difficulty_level: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const certificationId = searchParams.get('certification')

  const [certification, setCertification] = useState<Certification | null>(null)
  const [projectName, setProjectName] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!certificationId) {
      router.push('/certifications')
      return
    }

    fetchCertification()
  }, [user, certificationId, router])

  const fetchCertification = async () => {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', certificationId)
        .single()

      if (error) throw error

      setCertification(data)
      // デフォルトのプロジェクト名を設定
      setProjectName(`${data.name} 学習プロジェクト`)
      
      // デフォルトの目標日（推定期間から計算）
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + data.estimated_period)
      setTargetDate(targetDate.toISOString().split('T')[0])
    } catch (err: any) {
      console.error('資格情報の取得に失敗:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !certification) return

    setSubmitting(true)
    setError(null)

    try {
      // プロジェクトを作成
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          certification_id: certification.id,
          project_name: projectName.trim(),
          target_date: targetDate ? new Date(targetDate).toISOString() : null,
          status: 'active',
          progress_percentage: 0,
          studied_hours: 0
        })
        .select()
        .single()

      if (projectError) throw projectError

      // プロジェクト詳細ページにリダイレクト
      router.push(`/projects/${project.id}`)
    } catch (err: any) {
      console.error('プロジェクト作成に失敗:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return null // useEffectでリダイレクトされる
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (error && !certification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/certifications')}>
            資格一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  if (!certification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">資格が見つかりません</h1>
          <Button onClick={() => router.push('/certifications')}>
            資格一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">プロジェクト作成</h1>
          <p className="text-muted-foreground">
            新しい学習プロジェクトを作成します
          </p>
        </div>

        {/* 選択された資格の確認 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">選択された資格</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">{certification.name}</h3>
              <p className="text-sm text-muted-foreground">{certification.description}</p>
              <div className="flex gap-4 text-sm">
                <span>カテゴリ: {certification.category}</span>
                <span>難易度: {certification.difficulty_level}</span>
                <span>推定期間: {certification.estimated_period}日</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* プロジェクト作成フォーム */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">プロジェクト設定</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="projectName" className="text-sm font-medium">
                  プロジェクト名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="例: 基本情報技術者試験 学習プロジェクト"
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="targetDate" className="text-sm font-medium">
                  目標日
                </label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">
                  推定学習期間（{certification.estimated_period}日）を基に自動設定されています
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/certifications')}
                  disabled={submitting}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !projectName.trim()}
                  className="flex-1"
                >
                  {submitting ? '作成中...' : 'プロジェクトを作成'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}