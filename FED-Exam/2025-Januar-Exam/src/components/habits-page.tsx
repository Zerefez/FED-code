import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export function HabitsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mine Vaner</h2>
        <p className="text-muted-foreground">
          Administrer dine vaner og spor dit fremskridt, {user?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktive Vaner</CardTitle>
            <CardDescription>
              Vaner du arbejder på i øjeblikket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ingen aktive vaner endnu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gennemførte i dag</CardTitle>
            <CardDescription>
              Vaner gennemført i dag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              af 0 planlagte vaner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Denne uge</CardTitle>
            <CardDescription>
              Gennemsnit denne uge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Gennemførelsesrate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kommende funktioner</CardTitle>
          <CardDescription>
            Vaner funktionalitet kommer snart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Her vil du kunne oprette, redigere og spore dine daglige vaner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 