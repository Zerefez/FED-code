import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BookOpen, Calendar, Clock, FileText, Timer, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Velkommen til Eksamen Admin</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Administrer mundtlige eksamener, opret nye eksamensperioder, start eksamener og følg historik - alt på ét sted.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Se Alle Eksamener</CardTitle>
            <CardDescription>
              Browse og administrer alle dine mundtlige eksamener
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/exams">
              <Button className="w-full">Gå til Eksamener</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Opret Eksamen</CardTitle>
            <CardDescription>
              Opret en ny mundtlig eksamen med alle detaljer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/create-exam">
              <Button className="w-full ">Opret Ny</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Start Eksamen</CardTitle>
            <CardDescription>
              Start en eksamen og administrer studerende
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/start-exam">
              <Button className="w-full">Start Eksamen</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Se Historik</CardTitle>
            <CardDescription>
              Browse tidligere eksamener og resultater
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/history">
              <Button className="w-full">Se Historik</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-lg p-6 border">
        <h2 className="text-2xl font-semibold mb-6">Kom hurtigt i gang</h2>
        
        {/* Main workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">1. Opret Eksamen</h3>
            </div>
            <p className="text-sm text-blue-800">
              Opret en mundtlig eksamen med kursusdetaljer, eksamenstermin, dato, starttid, antal spørgsmål og eksaminationstid.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-900">2. Tilføj Studerende</h3>
            </div>
            <p className="text-sm text-green-800">
              Tilføj studerende til eksamen med studienummer, fornavn og efternavn. Du kan tilføje flere studerende på én gang.
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h3 className="font-medium text-orange-900">3. Gennemfør Eksamen</h3>
            </div>
            <p className="text-sm text-orange-800">
              Start eksamen og følg den 4-trins proces for hver studerende med spørgsmålstrækning, timer og karaktergivning.
            </p>
          </div>
        </div>

        {/* Detailed exam process */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Eksamen Process (4 trin per studerende)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <h4 className="font-medium">Træk Spørgsmål</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Træk et tilfældigt spørgsmål fra 1 til det maksimale antal spørgsmål for eksamen.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <h4 className="font-medium">Start Timer</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Start eksaminationstimeren som tæller ned fra den fastsatte eksaminationstid.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <h4 className="font-medium">Indtast Noter</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Skriv noter under eksaminationen og rediger dem efter behov.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <h4 className="font-medium">Giv Karakter</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Vælg karakter (12, 10, 7, 4, 02, 00, -3) og gem alle eksaminationsdata.
              </p>
            </div>
          </div>
        </div>

        {/* Key features */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Nøglefunktioner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Timer className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Automatisk Timer</h4>
                <p className="text-sm text-muted-foreground">
                  Nedtællingstimer med lydvarsling ved 1 minut tilbage og når tiden udløber.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Detaljeret Rapportering</h4>
                <p className="text-sm text-muted-foreground">
                  Gem spørgsmålsnummer, faktisk eksaminationstid, noter og karakter for hver studerende.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Historik & Statistik</h4>
                <p className="text-sm text-muted-foreground">
                  Se alle tidligere eksamener med gennemsnitskarakterer og fuldførelsesgrad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick tips */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Hurtige Tips</h3>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Du kan tilføje flere studerende ad gangen ved oprettelse</li>
              <li>• Timeren fortsætter selvom tiden udløber - du bestemmer hvornår eksamen stoppes</li>
              <li>• Noter kan redigeres både under og efter eksaminationen</li>
              <li>• Systemet gemmer automatisk faktisk eksaminationstid for hver studerende</li>
              <li>• Karakterer kan vælges fra standard skala eller indtastes manuelt</li>
              <li>• Historik viser status for alle eksamener (kommende, i gang, afsluttet)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 