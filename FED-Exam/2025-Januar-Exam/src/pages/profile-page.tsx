import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/use-profile';

export function ProfilePage() {
  const {
    isEditing,
    setIsEditing,
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSave,
    handleCancel
  } = useProfile();

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
            {errors.general && (
              <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="firstName">Fornavn</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lastName">Efternavn</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Rediger Profil
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Gemmer..." : "Gem Ændringer"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
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