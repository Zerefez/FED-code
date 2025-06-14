import { StatsCards } from '@/components/habits/stats-cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useHabits } from '@/hooks/use-habits';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { habits, loading, stats } = useHabits();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate additional stats
  const hasHabits = habits.length > 0;
  const completionPercentage = stats.activeHabits > 0 
    ? Math.round((stats.completedToday / stats.activeHabits) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Velkommen til dit habit tracker dashboard, {user?.firstName}!
        </p>
      </div>

      {/* Statistics Overview */}
      <StatsCards stats={stats} />

      {/* Quick Actions and Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dagens Fremskridt</CardTitle>
            <CardDescription>
              Dit fremskridt i dag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedToday} af {stats.activeHabits} vaner gennemført
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hurtige Handlinger</CardTitle>
            <CardDescription>
              Spring direkte til vigtige funktioner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/app/habits')} 
              className="w-full"
            >
              Gå til Mine Vaner
            </Button>
            <Button 
              onClick={() => navigate('/app/profile')} 
              variant="outline"
              className="w-full"
            >
              Rediger Profil
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ugentlig Trend</CardTitle>
            <CardDescription>
              Din udvikling denne uge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              gennemsnitlig gennemførelse
            </p>
            <div className="mt-2">
              {stats.weeklyCompletionRate >= 80 ? (
                <span className="text-green-600 text-sm">🔥 Fantastisk!</span>
              ) : stats.weeklyCompletionRate >= 60 ? (
                <span className="text-blue-600 text-sm">💪 Godt arbejde!</span>
              ) : stats.weeklyCompletionRate >= 40 ? (
                <span className="text-yellow-600 text-sm">⚡ Bliv ved!</span>
              ) : (
                <span className="text-orange-600 text-sm">🎯 Du kan gøre det!</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Section */}
      {!hasHabits && (
        <Card>
          <CardHeader>
            <CardTitle>Kom i gang</CardTitle>
            <CardDescription>
              Start din habit tracking rejse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Du har endnu ikke oprettet nogen vaner. Opret din første vane for at komme i gang med at tracke dine daglige rutiner.
            </p>
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">🌟 Opret din første vane! 🌟</p>
              <Button 
                onClick={() => navigate('/app/habits')}
                size="lg"
              >
                Opret Min Første Vane
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary for existing users */}
      {hasHabits && (
        <Card>
          <CardHeader>
            <CardTitle>Dagens Oversigt</CardTitle>
            <CardDescription>
              Hvad venter der på dig i dag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.completedToday === stats.activeHabits ? (
                <div className="text-center py-4">
                  <p className="text-lg font-medium text-green-600 mb-2">
                    🎉 Tillykke! Du har gennemført alle dine vaner i dag!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fantastisk arbejde med at holde dine gode vaner.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg font-medium mb-2">
                    Du har {stats.activeHabits - stats.completedToday} vaner tilbage at gennemføre i dag
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bliv ved det gode arbejde!
                  </p>
                  <Button 
                    onClick={() => navigate('/app/habits')}
                  >
                    Se Mine Vaner
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 