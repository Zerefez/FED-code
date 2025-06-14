import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitStats } from '@/hooks/use-habits';

interface StatsCardsProps {
  stats: HabitStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-l-primary/30">
        <CardHeader>
          <CardTitle className="text-primary">Aktive Vaner</CardTitle>
          <CardDescription>Antal vaner du tracker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.activeHabits}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeHabits === 0 ? 'Ingen vaner endnu' : 'registrerede vaner'}
          </p>
        </CardContent>
      </Card>

      <Card className={`border-l-4 ${stats.completedToday > 0 ? 'border-l-primary bg-primary/5' : 'border-l-muted'}`}>
        <CardHeader>
          <CardTitle className={stats.completedToday > 0 ? 'text-primary' : ''}>
            Gennemført i dag
          </CardTitle>
          <CardDescription>Vaner gennemført i dag</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.completedToday > 0 ? 'text-primary' : ''}`}>
            {stats.completedToday}
          </div>
          <p className="text-xs text-muted-foreground">
            af {stats.activeHabits} vaner gennemført
          </p>
          {stats.completedToday === stats.activeHabits && stats.activeHabits > 0 && (
            <div className="mt-2 text-xs text-primary font-medium">
              🎉 Alle vaner gennemført!
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`border-l-4 ${
        stats.weeklyCompletionRate >= 80 ? 'border-l-primary bg-primary/5' : 
        stats.weeklyCompletionRate >= 60 ? 'border-l-yellow-500 bg-yellow-50' : 
        'border-l-red-500 bg-red-50'
      }`}>
        <CardHeader>
          <CardTitle className={
            stats.weeklyCompletionRate >= 80 ? 'text-primary' : 
            stats.weeklyCompletionRate >= 60 ? 'text-yellow-600' : 
            'text-red-600'
          }>
            Uge gennemførelse
          </CardTitle>
          <CardDescription>Gennemførelse denne uge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            stats.weeklyCompletionRate >= 80 ? 'text-primary' : 
            stats.weeklyCompletionRate >= 60 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {stats.weeklyCompletionRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            af alle mulige vaner denne uge
          </p>
          {stats.weeklyCompletionRate >= 80 && (
            <div className="mt-2 text-xs text-primary font-medium">
              💪 Fantastisk fremgang!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 