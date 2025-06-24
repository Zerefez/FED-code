// Import the CreateExamForm component for exam creation UI
// This component handles all the form logic and validation for creating exams
import { CreateExamForm } from '@/components/exam/create-exam-form';

// Import navigation hook for programmatic routing
// This allows us to navigate to different pages after successful exam creation
import { useNavigate } from 'react-router-dom';

// CreateExamPage component - provides the interface for creating new exams
// This page serves as a container for the exam creation form
export function CreateExamPage() {
  // Get navigation function for programmatic routing
  // This enables navigation to other pages after exam creation
  const navigate = useNavigate();

  // Handler function called when an exam is successfully created
  // This provides the next step in the user workflow after form submission
  const handleExamCreated = () => {
    // Navigate to the exams list page to show the newly created exam
    // This gives users immediate feedback that their exam was created
    navigate('/exams');
  };

  // Handler function called when user cancels exam creation
  // This provides an escape route from the creation process
  const handleCancel = () => {
    // Navigate back to the exams list page without creating anything
    // This preserves user agency and prevents accidental form submission
    navigate('/exams');
  };

  // Render the page with header and form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header with title and description */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Opret Ny Eksamen</h1>
        <p className="text-muted-foreground">
          Udfyld formularen nedenfor for at oprette en ny eksamen
        </p>
      </div>

      {/* Exam creation form with success and cancel handlers */}
      <CreateExamForm 
        onExamCreated={handleExamCreated}  // Called when exam is successfully created
        onCancel={handleCancel}           // Called when user cancels the operation
      />
    </div>
  );
} 