import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useExamContext, useExamSessionContext } from '@/contexts';
import { CheckCircle, Plus, Users } from 'lucide-react';

export function StudentList() {
  const { students, completedStudentsCount, uncompletedStudents } = useExamContext();
  const { handleShowStudentForm } = useExamSessionContext();

  if (students.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen studerende endnu</h3>
          <p className="text-muted-foreground mb-4">
            Tilføj studerende til denne eksamen for at komme i gang
          </p>
          <Button className="gap-2" onClick={handleShowStudentForm}>
            <Plus className="h-4 w-4" />
            Tilføj den første studerende
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Show uncompleted students first */}
      {uncompletedStudents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-orange-600">
            Afventer eksamen ({uncompletedStudents.length})
          </h3>
          <div className="grid gap-3">
            {uncompletedStudents.map((student, index) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow border-orange-200">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Student nr: {student.studenNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-orange-600 font-medium">
                      Klar til eksamen
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Næste: #{index + 1}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show completed students */}
      {completedStudentsCount > 0 && (
        <div className={uncompletedStudents.length > 0 ? "mt-6" : ""}>
          <h3 className="text-lg font-semibold mb-3 text-green-600">
            Eksamen afsluttet ({completedStudentsCount})
          </h3>
          <div className="grid gap-3">
            {students.filter(student => student.grade).map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow border-green-200 bg-green-50/30">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Student nr: {student.studenNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {student.questionNo && (
                      <p className="text-sm font-medium text-green-600">
                        Spørgsmål {student.questionNo}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-green-600">
                        Karakter: {student.grade}
                      </p>
                    </div>
                    {student.examDurationMinutes && (
                      <p className="text-xs text-muted-foreground">
                        Varighed: {student.examDurationMinutes} min
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 