import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    // TODO: Implement profile update functionality
    console.log('Saving profile:', editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Min Profil</h2>
        <p className="text-muted-foreground">
          Administrer dine personlige oplysninger
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personlige Oplysninger</CardTitle>
            <CardDescription>
              Opdater dine profil oplysninger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Fornavn</Label>
              <Input
                id="firstName"
                value={isEditing ? editData.firstName : user?.firstName || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lastName">Efternavn</Label>
              <Input
                id="lastName"
                value={isEditing ? editData.lastName : user?.lastName || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? editData.email : user?.email || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Rediger Profil
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave}>
                    Gem Ændringer
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Annuller
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konto Statistik</CardTitle>
            <CardDescription>
              Oversigt over din konto aktivitet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Medlem siden:</span>
              <span className="text-sm font-medium">I dag</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Aktive vaner:</span>
              <span className="text-sm font-medium">0</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gennemførte vaner:</span>
              <span className="text-sm font-medium">0</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nuværende streak:</span>
              <span className="text-sm font-medium">0 dage</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontoindstillinger</CardTitle>
          <CardDescription>
            Administrer dine kontoindstillinger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funktioner som password ændring og konto sletning kommer snart.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 