import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '@/types/exam';
import { User } from 'lucide-react';

// Props interface defining the data this component needs
// This ensures type safety and clear component requirements
interface StudentInfoCardProps {
  student: Student;           // The current student being examined
  currentIndex: number;       // Zero-based index of current student
  totalStudents: number;      // Total number of students to examine
}

// Component that displays current student information during exam session
// This provides context and helps examiner verify they have the correct student
export function StudentInfoCard({ student, currentIndex, totalStudents }: StudentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* User icon provides visual context */}
          <User className="h-5 w-5" />
          
          {/* Progress indicator showing current position in exam sequence */}
          {/* Convert zero-based index to one-based for human-readable display */}
          Nuværende studerende ({currentIndex + 1} af {totalStudents})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Grid layout for organized display of student information */}
        <div className="grid grid-cols-2 gap-4">
          {/* Student's full name */}
          <div>
            <p className="text-sm text-muted-foreground">Navn</p>
            {/* Combine first and last name with space */}
            <p className="font-medium">{student.firstName} {student.lastName}</p>
          </div>
          
          {/* Student's identification number */}
          <div>
            <p className="text-sm text-muted-foreground">Studienummer</p>
            {/* Display the unique student number for verification */}
            <p className="font-medium">{student.studenNo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 