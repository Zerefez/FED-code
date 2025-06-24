import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExamContext } from '@/contexts';
import { completionLock, formatDate } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ExamCompletedProps {
  onNavigateToHistory: () => void;
  onNavigateToExams: () => void;
}

export function ExamCompleted({
  onNavigateToHistory,
  onNavigateToExams,
}: ExamCompletedProps) {
  const { exam, students, completedStudentsCount } = useExamContext();

  if (!exam) {
    return null; // Should not render if no exam
  }

  const handleNavigateToHistory = () => {
    completionLock.unlock();
    onNavigateToHistory();
  };

  const handleNavigateToExams = () => {
    completionLock.unlock();
    onNavigateToExams();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Eksamen afsluttet!</h1>
        <p className="text-muted-foreground mb-6">
          Alle studerende har gennemført eksamen i {exam.courseName}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleNavigateToHistory}>
            Se Historik
          </Button>
          <Button onClick={handleNavigateToExams} variant="outline">
            Tilbage til Eksamener
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Eksamen oversigt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Kursus</p>
                <p className="font-medium">{exam.courseName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dato</p>
                <p className="font-medium">{formatDate(exam.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Studerende</p>
                <p className="font-medium">{students.length} total</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Afsluttede</p>
                <p className="font-medium">{completedStudentsCount} / {students.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 