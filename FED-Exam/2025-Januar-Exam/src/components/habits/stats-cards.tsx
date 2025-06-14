import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitStats } from '@/hooks/use-habits';

interface StatsCardsProps {
  stats: HabitStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Aktive Vaner</CardTitle>
          <CardDescription>Antal vaner du tracker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeHabits}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeHabits === 0 ? 'Ingen vaner endnu' : 'registrerede vaner'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gennemført i dag</CardTitle>
          <CardDescription>Vaner gennemført i dag</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedToday}</div>
          <p className="text-xs text-muted-foreground">
            af {stats.activeHabits} vaner gennemført
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uge gennemførelse</CardTitle>
          <CardDescription>Gennemførelse denne uge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weeklyCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            af alle mulige vaner denne uge
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 