import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui'

export default function CertificationsPage() {
  const certifications = [
    {
      id: 1,
      name: 'ITパスポート',
      description: 'ITに関する基礎的な知識を問う国家試験',
      difficulty: '初級',
      estimatedPeriod: '3ヶ月',
      passingScore: 600,
      examFee: 7500,
    },
    {
      id: 2,
      name: '基本情報技術者試験',
      description: 'ITエンジニアの基礎知識を問う国家試験',
      difficulty: '中級',
      estimatedPeriod: '6ヶ月',
      passingScore: 600,
      examFee: 7500,
    },
    {
      id: 3,
      name: '応用情報技術者試験',
      description: 'より高度なIT技術知識を問う国家試験',
      difficulty: '上級',
      estimatedPeriod: '9ヶ月',
      passingScore: 600,
      examFee: 7500,
    },
  ]

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case '初級': return 'default'
      case '中級': return 'secondary'
      case '上級': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">資格一覧</h1>
          <p className="text-muted-foreground">
            目指したい資格を選択して学習を始めましょう
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{cert.name}</CardTitle>
                  <Badge variant={getDifficultyVariant(cert.difficulty) as any}>
                    {cert.difficulty}
                  </Badge>
                </div>
                <CardDescription>{cert.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">学習期間目安:</span>
                    <br />
                    {cert.estimatedPeriod}
                  </div>
                  <div>
                    <span className="font-medium">受験料:</span>
                    <br />
                    ¥{cert.examFee.toLocaleString()}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">合格点:</span> {cert.passingScore}点
                </div>
                <Button className="w-full">
                  この資格で始める
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}