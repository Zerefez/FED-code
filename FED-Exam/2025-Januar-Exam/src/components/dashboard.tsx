import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Velkommen til dit habit tracker dashboard, {user?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mine Vaner</CardTitle>
            <CardDescription>
              Oversigt over dine registrerede vaner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ingen vaner registreret endnu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dagens Fremskridt</CardTitle>
            <CardDescription>
              Dit fremskridt i dag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Af dagens mål gennemført
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
            <CardDescription>
              Din længste streak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              dage i træk
            </p>
          </CardContent>
        </Card>
      </div>

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
          <div className="text-center">
            <p className="text-lg font-medium">🌟 Opret din første vane! 🌟</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 