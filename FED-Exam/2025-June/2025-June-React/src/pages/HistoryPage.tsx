import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExams, useStudents } from '@/hooks';
import { calculateAverageGrade, filterCompletedStudents, formatDate } from '@/lib/utils';
import type { Exam } from '@/types/exam';
import { Calendar, Clock, Eye, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ExamWithStats extends Exam {
  studentCount: number;
  averageGrade: number | null;
  completedStudents: number;
}

export function HistoryPage() {
  const { items: allExams } = useExams();
  const { items: allStudents } = useStudents();
  const [exams, setExams] = useState<ExamWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (allExams.length > 0 && allStudents.length >= 0) {
      loadHistoryData();
      setIsLoading(false);
    }
  }, [allExams, allStudents]);

  const loadHistoryData = () => {
    try {
      const examsWithStats: ExamWithStats[] = allExams.map(exam => {
        const examStudents = allStudents.filter(student => student.exam === exam.id);
        const completedStudents = filterCompletedStudents(examStudents);
        
        return {
          ...exam,
          studentCount: examStudents.length,
          averageGrade: calculateAverageGrade(examStudents),
          completedStudents: completedStudents.length
        };
      });

      examsWithStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setExams(examsWithStats);
    } catch (error) {
      console.error('Fejl ved indlæsning af historik:', error);
    }
  };

  const getStatusColor = (exam: ExamWithStats) => {
    const examDate = new Date(exam.date);
    const today = new Date();
    
    if (examDate > today) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (exam.completedStudents === exam.studentCount && exam.studentCount > 0) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (examDate <= today && exam.studentCount > 0) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (exam: ExamWithStats) => {
    const examDate = new Date(exam.date);
    const today = new Date();
    
    if (examDate > today) {
      return 'Kommende';
    } else if (exam.completedStudents === exam.studentCount && exam.studentCount > 0) {
      return 'Afsluttet';
    } else if (examDate <= today && exam.studentCount > 0) {
      return 'I gang';
    } else {
      return 'Ikke startet';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Indlæser historik...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Eksamen Historik</h1>
        <p className="text-muted-foreground">
          Oversigt over alle dine eksamener og deres resultater
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eksamener</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afsluttede</CardTitle>
            <TrendingUp className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(exam => exam.completedStudents === exam.studentCount && exam.studentCount > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Studerende</CardTitle>
            <Users className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.reduce((sum, exam) => sum + exam.studentCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bedømte Studerende</CardTitle>
            <TrendingUp className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.reduce((sum, exam) => sum + exam.completedStudents, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {exams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen eksamen historik</h3>
            <p className="text-muted-foreground mb-4">
              Du har ikke oprettet nogen eksamener endnu
            </p>
            <Link to="/create-exam">
              <Button>Opret din første eksamen</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{exam.courseName}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(exam)}`}>
                        {getStatusText(exam)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(exam.date, 'short')} • {exam.startTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{exam.examDurationMinutes} min • {exam.numberOfQuestions} spørgsmål</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{exam.completedStudents}/{exam.studentCount} studerende</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          {exam.averageGrade !== null ? `Ø ${exam.averageGrade.toFixed(1)}` : 'Ikke bedømt'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">{exam.examtermin}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/start-exam/${exam.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Se detaljer
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 