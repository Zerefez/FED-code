import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Exam } from '@/types/exam';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';

// Props interface defining what this component needs from parent
// This establishes clear data flow and event handling contracts
interface ExamListProps {
  exams: Exam[];                    // Array of exam objects to display
  loading: boolean;                 // Whether data is currently being loaded
  onCreateExam: () => void;         // Function to navigate to exam creation
  onSelectExam: (exam: Exam) => void; // Function to handle exam selection
}

// Component that displays a list of available exams
// This serves as the main navigation hub for exam management
export function ExamList({ exams, loading: isLoading, onCreateExam, onSelectExam }: ExamListProps) {
  // Show loading state while data is being fetched
  // This provides user feedback during async operations
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Indlæser eksamener...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header with title, description, and primary action */}
      <div className="flex justify-between items-center">
        <div>
          {/* Main page title */}
          <h1 className="text-3xl font-bold">Mundtlige eksamener</h1>
          
          {/* Descriptive subtitle explaining the page purpose */}
          <p className="text-muted-foreground">
            Administrer dine mundtlige eksamener og studerende
          </p>
        </div>
        
        {/* Primary action button for creating new exams */}
        <Button onClick={onCreateExam} className="gap-2">
          <Plus className="h-4 w-4" />
          Opret eksamen
        </Button>
      </div>

      {/* Conditional rendering based on whether exams exist */}
      {exams.length === 0 ? (
        // Empty state when no exams are available
        // This provides guidance for first-time users
        <Card className="text-center py-12">
          <CardContent>
            {/* Empty state icon */}
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            
            {/* Empty state heading */}
            <h3 className="text-lg font-semibold mb-2">Ingen eksamener endnu</h3>
            
            {/* Helpful guidance text */}
            <p className="text-muted-foreground mb-4">
              Kom i gang ved at oprette din første mundtlige eksamen
            </p>
            
            {/* Call-to-action button */}
            <Button onClick={onCreateExam} className="gap-2">
              <Plus className="h-4 w-4" />
              Opret eksamen
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Grid of exam cards when exams are available
        // Responsive grid that adapts to screen size
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card 
              key={exam.id}                              // React key for list rendering
              className="cursor-pointer hover:shadow-md transition-shadow" // Interactive styling
              onClick={() => onSelectExam(exam)}        // Handle exam selection
            >
              <CardHeader>
                {/* Exam title - the course name */}
                <CardTitle className="text-lg">{exam.courseName}</CardTitle>
                
                {/* Exam date with calendar icon */}
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(exam.date)}                // Format date for display
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {/* Exam timing information */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {/* Combine start time and duration in one line */}
                  <span>{exam.startTime} • {exam.examDurationMinutes} min</span>
                </div>
                
                {/* Number of questions information */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{exam.numberOfQuestions} spørgsmål</span>
                </div>
                
                {/* Exam term with primary color for emphasis */}
                <div className="text-sm font-medium text-primary">
                  {exam.examtermin}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 