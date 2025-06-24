import { useExams, useStudents } from '@/hooks';
import { filterCompletedStudents, filterUncompletedStudents } from '@/lib/utils';
import type { Exam, Student } from '@/types/exam';
import { useEffect, useMemo, useState } from 'react';

interface UseExamDataReturn {
  exam: Exam | null;
  students: Student[];
  isLoading: boolean;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  handleStudentAdded: (newStudent: Student) => void;
  handleStudentUpdate: (updatedStudent: Student, onComplete?: () => void) => void;
  completedStudentsCount: number;
  uncompletedStudents: Student[];
}

export function useExamData(examId: string | undefined): UseExamDataReturn {
  const { items: allExams, loading: examsLoading, refresh: refreshExams } = useExams();
  const { getByExam: getStudentsByExam } = useStudents();
  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const completedStudentsCount = useMemo(() => 
    filterCompletedStudents(students).length, 
    [students]
  );

  const uncompletedStudents = useMemo(() => 
    filterUncompletedStudents(students), 
    [students]
  );

  useEffect(() => {
    if (!examId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      let examData: Exam | undefined = undefined;
      
      try {
        examData = allExams.find(e => e.id === examId);
        
        if (!examData && !examsLoading && allExams.length > 0) {
          await refreshExams();
          return;
        }
        
        if (examData) {
          const studentsData = await getStudentsByExam(examId);
          setExam(examData);
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Fejl ved indlæsning af eksamen:', error);
      } finally {
        if (examData || allExams.length > 0) {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [examId, allExams, examsLoading, refreshExams, getStudentsByExam]);

  
  const handleStudentAdded = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
  };

  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudents(prev => {
      const newStudents = prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      );
      return newStudents;
    });
  };

  return {
    exam,
    students,
    isLoading,
    setStudents,
    handleStudentAdded,
    handleStudentUpdate,
    completedStudentsCount,
    uncompletedStudents,
  };
} 