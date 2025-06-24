import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExams, useForm } from '@/hooks';
import { useValidation, validators } from '@/hooks/useValidation';
import type { CreateExamData, Exam } from '@/types/exam';

// Props interface defining callbacks this form component provides
// This establishes clear communication between form and parent component
interface CreateExamFormProps {
  onExamCreated: (exam: Exam) => void;    // Called when exam is successfully created
  onCancel: () => void;                   // Called when user cancels form
}

// Initial form data with sensible defaults
// This provides a good starting point for most exam scenarios
const initialFormData: CreateExamData = {
  examtermin: '',           // Empty - user must specify
  courseName: '',           // Empty - user must specify
  date: '',                 // Empty - user must specify
  numberOfQuestions: 1,     // Default to at least 1 question
  examDurationMinutes: 15,  // Default 15 minutes (common for oral exams)
  startTime: '09:00',       // Default morning start time
};

// Validation rules for form fields using the validation system
// These ensure data quality and prevent invalid exam creation
const validationRules = [
  { field: 'examtermin' as const, validator: validators.required },      // Exam term is required
  { field: 'courseName' as const, validator: validators.required },     // Course name is required
  { field: 'date' as const, validator: validators.required },           // Date is required
  { field: 'numberOfQuestions' as const, validator: validators.min(1) }, // At least 1 question
  { field: 'examDurationMinutes' as const, validator: validators.min(1) }, // At least 1 minute
  { field: 'startTime' as const, validator: validators.required },      // Start time is required
];

// Main form component for creating new exams
// This component handles all aspects of exam creation with validation
export function CreateExamForm({ onExamCreated, onCancel }: CreateExamFormProps) {
  // Hook for CRUD operations on exams
  const { create: createExam } = useExams();
  
  // Form management hook providing state and handlers
  const { data: formData, loading: isLoading, set, handleSubmit } = useForm<CreateExamData>(initialFormData);
  
  // Validation hook for field-level error handling
  const { errors, validate, clearError } = useValidation<CreateExamData>();

  // Handler for input changes that updates state and clears errors
  // This provides immediate feedback when users correct validation errors
  const handleInputChange = (field: keyof CreateExamData, value: string | number) => {
    set(field, value);        // Update form data
    clearError(field);        // Clear any existing error for this field
  };

  // Form submission handler with validation and API call
  const onSubmit = async (data: CreateExamData) => {
    // Validate all fields before submission
    if (!validate(data, validationRules)) {
      return; // Stop if validation fails
    }

    try {
      // Attempt to create the exam via API
      const exam = await createExam(data);
      
      // If successful, notify parent component
      if (exam) {
        onExamCreated(exam);
      }
    } catch (error) {
      // Log errors for debugging - in production this might show user feedback
      console.error('Fejl ved oprettelse af eksamen:', error);
    }
  };

  return (
    // Card wrapper provides consistent styling and layout
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        {/* Clear title and description for form purpose */}
        <CardTitle>Opret ny eksamen</CardTitle>
        <CardDescription>
          Indtast oplysninger om den mundtlige eksamen
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Form with proper submission handling */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid layout for responsive field arrangement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Exam term field */}
            <div className="space-y-2">
              <Label htmlFor="examtermin">Eksamenstermin</Label>
              <Input
                id="examtermin"                                    // Links to label
                type="text"                                        // Text input
                placeholder="f.eks. sommer 25"                    // Example guidance
                value={formData.examtermin}                        // Controlled value
                onChange={(e) => handleInputChange('examtermin', e.target.value)} // Update handler
                aria-invalid={!!errors.examtermin}                // Accessibility for errors
              />
              {/* Conditional error display */}
              {errors.examtermin && (
                <p className="text-sm text-destructive">{errors.examtermin}</p>
              )}
            </div>

            {/* Course name field */}
            <div className="space-y-2">
              <Label htmlFor="courseName">Kursusnavn</Label>
              <Input
                id="courseName"
                type="text"
                placeholder="f.eks. Introduktion til Programmering"
                value={formData.courseName}
                onChange={(e) => handleInputChange('courseName', e.target.value)}
                aria-invalid={!!errors.courseName}
              />
              {errors.courseName && (
                <p className="text-sm text-destructive">{errors.courseName}</p>
              )}
            </div>

            {/* Date field using HTML5 date input */}
            <div className="space-y-2">
              <Label htmlFor="date">Dato</Label>
              <Input
                id="date"
                type="date"                                        // HTML5 date picker
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            {/* Start time field using HTML5 time input */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Starttidspunkt</Label>
              <Input
                id="startTime"
                type="time"                                        // HTML5 time picker
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                aria-invalid={!!errors.startTime}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime}</p>
              )}
            </div>

            {/* Number of questions field */}
            <div className="space-y-2">
              <Label htmlFor="numberOfQuestions">Antal spørgsmål</Label>
              <Input
                id="numberOfQuestions"
                type="number"                                      // Numeric input
                min="1"                                            // HTML validation
                value={formData.numberOfQuestions}
                // Parse integer or default to 1 to prevent NaN
                onChange={(e) => handleInputChange('numberOfQuestions', parseInt(e.target.value) || 1)}
                aria-invalid={!!errors.numberOfQuestions}
              />
              {errors.numberOfQuestions && (
                <p className="text-sm text-destructive">{errors.numberOfQuestions}</p>
              )}
            </div>

            {/* Exam duration field */}
            <div className="space-y-2">
              <Label htmlFor="examDurationMinutes">Eksaminationstid (minutter)</Label>
              <Input
                id="examDurationMinutes"
                type="number"
                min="1"
                value={formData.examDurationMinutes}
                // Parse integer or default to 15 to prevent NaN
                onChange={(e) => handleInputChange('examDurationMinutes', parseInt(e.target.value) || 15)}
                aria-invalid={!!errors.examDurationMinutes}
              />
              {errors.examDurationMinutes && (
                <p className="text-sm text-destructive">{errors.examDurationMinutes}</p>
              )}
            </div>
          </div>

          {/* Form action buttons */}
          <div className="flex justify-end gap-4">
            {/* Cancel button - outline variant for secondary action */}
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuller
            </Button>
            
            {/* Submit button - primary variant with loading state */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Opretter...' : 'Opret eksamen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 