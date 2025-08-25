'use client'
import { useAuth } from '@/hooks/useAuth'; 
import { useProjects } from '@/hooks/useProjects';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { projects } = useProjects()

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalStudiedHours = projects.reduce((sum, p) => sum + p.studied_hours, 0)
  
  if (loading) {
    return <div>読み込み中...</div>
  }
  if (!user) {
    return <div>ログインしてください</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">ユーザプロファイル</h1>
          <p className="text-muted-foreground">
            ユーザー情報 
          </p>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>プロフィール</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.displayName && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">ユーザー名</p>
                    <p className="text-sm">{user.displayName}</p>
                    <p className="text-sm">{user.email}</p>
                    {user.avatarUrl && (
                      <img 
                        src={user.avatarUrl} 
                        alt="avatar"
                        className="w-16 h-16 rounded-full mt-2"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          
            <div className="space-y-2">
              <h2 className="text-xl font-bold">統計情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      プロジェクトの数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {totalProjects}
                  </CardContent>
                </Card>
              
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      アクティブなプロジェクトの数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {activeProjects}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      これまでの学習時間
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {totalStudiedHours}
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}