'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui'

interface Certification {
  id: string
  name: string
  description: string
  category: string
  estimated_period: number
  difficulty_level: string
  official_url?: string
  passing_score?: number
  exam_fee?: number
  is_active: boolean
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .eq('is_active', true)
          .order('difficulty_level', { ascending: true })
          .order('category')
          .order('name')

        if (error) {
          throw error
        }

        setCertifications(data || [])
      } catch (err: any) {
        console.error('資格データの取得に失敗:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [])

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case '初級': return 'default'
      case '中級': return 'secondary'
      case '上級': return 'destructive'
      default: return 'outline'
    }
  }

  const formatPeriod = (days: number) => {
    if (days >= 30) {
      const months = Math.round(days / 30)
      return `${months}ヶ月`
    }
    return `${days}日`
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            再読み込み
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">資格一覧</h1>
          <p className="text-muted-foreground">
            目指したい資格を選択して学習を始めましょう ({certifications.length}件)
          </p>
        </div>

        {certifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">資格データがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{cert.name}</CardTitle>
                    <Badge variant={getDifficultyVariant(cert.difficulty_level) as any}>
                      {cert.difficulty_level}
                    </Badge>
                  </div>
                  <CardDescription>{cert.description}</CardDescription>
                  <div className="text-sm text-muted-foreground">
                    カテゴリ: {cert.category}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">学習期間目安:</span>
                      <br />
                      {formatPeriod(cert.estimated_period)}
                    </div>
                    <div>
                      <span className="font-medium">受験料:</span>
                      <br />
                      {cert.exam_fee ? `¥${cert.exam_fee.toLocaleString()}` : '未設定'}
                    </div>
                  </div>
                  {cert.passing_score && (
                    <div className="text-sm">
                      <span className="font-medium">合格点:</span> {cert.passing_score}点
                    </div>
                  )}
                  {cert.official_url && (
                    <div className="text-sm">
                      <a 
                        href={cert.official_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        公式サイト →
                      </a>
                    </div>
                  )}
                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = `/projects/create?certification=${cert.id}`}
                  >
                    この資格で始める
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}