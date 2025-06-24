import { ExamCompleted } from '@/components/exam/exam-completed';
import { ExamList } from '@/components/exam/exam-list';
import { ExamOverview } from '@/components/exam/exam-overview';
import { ExamSession } from '@/components/exam/exam-session';
import { StudentForm } from '@/components/exam/student-form';
import { StudentList } from '@/components/exam/student-list';
import { Button } from '@/components/ui/button';
import { ExamProvider, ExamSessionProvider, useExamContext, useExamSessionContext } from '@/contexts';
import { useExams } from '@/hooks';
import type { Exam } from '@/types/exam';
import { useNavigate, useParams } from 'react-router-dom';

// Inner component that uses contexts and manages exam workflow
// This component has access to exam and session context after they're provided
function StartExamContent() {
  // Get navigation function for programmatic routing
  const navigate = useNavigate();
  
  // Extract exam data and loading state from exam context
  const { exam, isLoading } = useExamContext();
  
  // Extract page state management from exam session context
  // This controls which UI phase is currently displayed
  const { pageState, setPageState } = useExamSessionContext();

  // Navigation handler functions for different user actions
  // These provide clean APIs for moving between different parts of the app
  const handleNavigateToHistory = () => navigate('/history');
  const handleNavigateToExams = () => navigate('/exams');
  const handleBackToOverview = () => setPageState('overview');

  // Show loading spinner while exam data is being fetched
  // This provides user feedback during data loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Indlæser eksamen...</p>
      </div>
    );
  }

  // Show error state if exam data couldn't be loaded
  // This handles cases where the exam ID is invalid or data is missing
  if (!exam) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Start Eksamen</h1>
          <p className="text-muted-foreground mb-6">
            Vælg en eksamen for at starte eller administrere studerende
          </p>
          <Button onClick={handleNavigateToExams}>
            Vælg Eksamen
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to render consistent page header across different states
  // This reduces code duplication and ensures consistent styling
  const renderPageHeader = () => (
    <div className="flex justify-between items-center">
      <div>
        {/* Display exam course name as main title */}
        <h1 className="text-3xl font-bold">{exam.courseName}</h1>
        {/* Display exam term as subtitle */}
        <p className="text-muted-foreground">{exam.examtermin}</p>
      </div>
      {/* Navigation button to return to exam list */}
      <Button onClick={handleNavigateToExams} variant="outline">
        Tilbage til Eksamener
      </Button>
    </div>
  );

  // Show student form when adding students to the exam
  // This state is triggered when user wants to register new students
  if (pageState === 'adding-students') {
    return (
      <div className="space-y-6">
        {renderPageHeader()}
        <StudentForm />
      </div>
    );
  }

  // Show exam session interface when conducting actual examinations
  // This state is triggered when user starts examining students
  if (pageState === 'exam-running') {
    return (
      <div className="space-y-6">
        {/* Header with different back button for exam session */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{exam.courseName}</h1>
            <p className="text-muted-foreground">{exam.examtermin}</p>
          </div>
          {/* Back button that returns to overview, not exam list */}
          <Button onClick={handleBackToOverview} variant="outline">
            Tilbage til oversigt
          </Button>
        </div>
        
        {/* Main exam session component for conducting examinations */}
        <ExamSession />
      </div>
    );
  }

  // Show exam completed summary when all students have been examined
  // This state is triggered when the last student completes their exam
  if (pageState === 'exam-completed') {
    return (
      <ExamCompleted
        onNavigateToHistory={handleNavigateToHistory}  // Navigate to history page
        onNavigateToExams={handleNavigateToExams}      // Navigate to exams list
      />
    );
  }

  // Show main overview (default state)
  // This is the primary interface for managing an exam and its students
  return (
    <div className="space-y-6">
      {renderPageHeader()}
      {/* Exam statistics and management overview */}
      <ExamOverview />
      {/* List of students registered for this exam */}
      <StudentList />
    </div>
  );
}

// Component to show exam selection when no examId is provided in URL
// This handles the case where user navigates to /start-exam without specifying an exam
function ExamSelection() {
  // Get navigation function for routing to selected exam
  const navigate = useNavigate();
  
  // Fetch all available exams for selection
  const { items: exams, loading, error } = useExams();

  // Handler for when user selects an exam to manage
  // Navigates to the exam management page with the selected exam ID
  const handleSelectExam = (exam: Exam) => {
    navigate(`/start-exam/${exam.id}`);
  };

  // Handler for when user wants to create a new exam
  // Navigates to the exam creation page
  const handleCreateExam = () => {
    navigate('/create-exam');
  };

  // Show error message if exam data couldn't be loaded
  // This provides user feedback when API requests fail
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Fejl: {error}</p>
      </div>
    );
  }

  // Render exam selection interface
  return (
    <div className="space-y-6">
      {/* Page header explaining the selection process */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Start Eksamen</h1>
        <p className="text-muted-foreground mb-6">
          Vælg en eksamen for at starte eller administrere studerende
        </p>
      </div>
      
      {/* Exam list component with selection and creation handlers */}
      <ExamList 
        exams={exams}                      // Array of available exams
        loading={loading}                  // Loading state for spinner
        onCreateExam={handleCreateExam}    // Handler for creating new exam
        onSelectExam={handleSelectExam}    // Handler for selecting existing exam
      />
    </div>
  );
}

// Main component that provides contexts and handles routing logic
// This component determines whether to show exam selection or exam management
export function StartExamPage() {
  // Extract examId parameter from URL using React Router
  const { examId } = useParams<{ examId: string }>();

  // If no examId is provided, show exam selection interface
  // This handles the route /start-exam without parameters
  if (!examId) {
    return <ExamSelection />;
  }

  // If examId is provided, render exam management with contexts
  // The context providers ensure child components have access to exam data
  return (
    <ExamProvider examId={examId}>        {/* Provides exam data and CRUD operations */}
      <ExamSessionProvider>               {/* Provides session state management */}
        <StartExamContent />             {/* Main content with context access */}
      </ExamSessionProvider>
    </ExamProvider>
  );
} 