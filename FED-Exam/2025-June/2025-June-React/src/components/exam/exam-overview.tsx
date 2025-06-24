import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExamContext, useExamSessionContext } from '@/contexts';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, Play, Plus, Users } from 'lucide-react';

export function ExamOverview() {
  const { exam, students, completedStudentsCount, uncompletedStudents } = useExamContext();
  const { handleStartExam, handleShowStudentForm } = useExamSessionContext();

  if (!exam) {
    return null; // Should not render if no exam
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eksamensdato</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(exam.date)}</div>
            <p className="text-xs text-muted-foreground">
              Starter kl. {exam.startTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Varighed</CardTitle>
            <Clock className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.examDurationMinutes} min</div>
            <p className="text-xs text-muted-foreground">
              {exam.numberOfQuestions} spørgsmål
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Studerende</CardTitle>
            <Users className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedStudentsCount} afsluttede
            </p>
          </CardContent>
        </Card>
      </div>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Klar til at starte eksamen?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                {uncompletedStudents.length > 0 ? (
                  <>
                    <p className="text-muted-foreground">
                      {uncompletedStudents.length} studerende er klar til eksamen.
                    </p>
                    {completedStudentsCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {completedStudentsCount} studerende har allerede afsluttet.
                      </p>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-muted-foreground">
                      Alle {students.length} studerende har gennemført eksamen.
                    </p>
                    <p className="text-sm text-green-600">
                      ✓ Eksamen er fuldført for alle studerende
                    </p>
                  </div>
                )}
              </div>
              {uncompletedStudents.length > 0 ? (
                <Button onClick={() => handleStartExam(students)} size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Eksamen
                </Button>
              ) : (
                <div className="text-green-600 font-medium">
                  ✓ Alle studerende har gennemført eksamen
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Studerende</h2>
          <Button className="gap-2" onClick={handleShowStudentForm}>
            <Plus className="h-4 w-4" />
            Tilføj Studerende
          </Button>
        </div>
      </div>
    </>
  );
} 