// Import ExamList component for displaying the list of exams
// This component handles the presentation and interaction with exam data
import { ExamList } from '@/components/exam/exam-list';

// Import custom hook for exam data management
// This provides access to exam data with loading states and error handling
import { useExams } from '@/hooks';

// Import type definition for type safety when handling exam data
import type { Exam } from '@/types/exam';

// Import navigation hook for programmatic route changes
// This allows us to navigate to different pages based on user actions
import { useNavigate } from 'react-router-dom';

// ExamsPage component - displays a list of all available exams
// This serves as the main exam browsing interface for users
export function ExamsPage() {
  // Get navigation function for programmatic routing
  // This enables navigation to other pages when users interact with exams
  const navigate = useNavigate();
  
  // Fetch exam data using custom hook
  // Destructure to get items (renamed to exams), loading state, and error state
  const { items: exams, loading, error } = useExams();

  // Handler function for creating a new exam
  // Navigates to the exam creation page when triggered
  const handleCreateExam = () => {
    navigate('/create-exam');
  };

  // Handler function for selecting an existing exam
  // Navigates to the exam management page for the selected exam
  const handleSelectExam = (exam: Exam) => {
    // Navigate to start exam page with the specific exam ID
    navigate(`/start-exam/${exam.id}`);
  };

  // Error handling - display error message if data loading fails
  // This provides user feedback when the API request fails
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Fejl: {error}</p>
      </div>
    );
  }

  // Main component render - display the exam list with all necessary props
  return (
    <ExamList 
      exams={exams}                    // Array of exam data to display
      loading={loading}                // Loading state for showing spinner/skeleton
      onCreateExam={handleCreateExam}  // Callback for creating new exam
      onSelectExam={handleSelectExam}  // Callback for selecting existing exam
    />
  );
} 