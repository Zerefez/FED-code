import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExamContext, useExamSessionContext } from '@/contexts';
import { useForm, useStudents } from '@/hooks';
import type { CreateStudentData } from '@/types/exam';
import { Plus, X } from 'lucide-react';

// Form state interface defining the structure for multiple student entries
// This allows adding multiple students in a single form submission
interface StudentFormState {
  students: Omit<CreateStudentData, 'exam'>[];     // Array of student data objects without exam field
}

// Initial form state with one empty student row
// This provides a starting point for the form with minimal setup
const initialFormData: StudentFormState = {
  students: [{ studenNo: '', firstName: '', lastName: '' }]
};

// Main component for adding students to an exam
// This handles the complex workflow of adding multiple students with validation
export function StudentForm() {
  // Get exam context for current exam and student management
  const { exam, students: existingStudents, handleStudentAdded } = useExamContext();
  
  // Get session context for form navigation
  const { handleStudentFormCancel } = useExamSessionContext();
  
  // Hook for student CRUD operations
  const { create: createStudent } = useStudents();
  
  // Form management hook with extended functionality for complex form
  const {
    data: formData,           // Current form data
    errors,                   // Field validation errors
    loading: isLoading,       // Whether form is submitting
    set,                      // Function to update form data
    setError,                 // Function to set field errors
    clearError,               // Function to clear field errors
    handleSubmit,             // Form submission wrapper
  } = useForm<StudentFormState>(initialFormData);

  // Early return if no exam is available
  // This prevents the form from being used in invalid contexts
  if (!exam) {
    return null; // Should not render if no exam
  }

  // Function to add a new empty student row to the form
  // This allows dynamic form expansion for multiple students
  const addStudentRow = () => {
    const newStudents = [...formData.students, { studenNo: '', firstName: '', lastName: '' }];
    set('students', newStudents);
  };

  // Function to remove a student row from the form
  // Prevents removing the last row to maintain form usability
  const removeStudentRow = (index: number) => {
    // Only allow removal if more than one student exists
    if (formData.students.length > 1) {
      // Filter out the student at the specified index
      const newStudents = formData.students.filter((_, i) => i !== index);
      set('students', newStudents);
      
      // Clear any errors related to the removed row
      // This prevents stale error messages from appearing
      Object.keys(errors).forEach(key => {
        if (key.startsWith(`${index}_`)) {
          clearError(key as keyof StudentFormState);
        }
      });
    }
  };

  // Function to update a specific field for a specific student
  // This handles the complexity of nested form data updates
  const updateStudent = (index: number, field: keyof CreateStudentData, value: string) => {
    // Create new array with the updated student
    const newStudents = formData.students.map((student, i) => 
      i === index ? { ...student, [field]: value } : student
    );
    set('students', newStudents);
    
    // Clear error for this specific field if it exists
    const errorKey = `${index}_${field}`;
    if (errors[errorKey]) {
      clearError(errorKey as keyof StudentFormState);
    }
  };

  // Comprehensive form validation function
  // This handles multiple validation scenarios for student data
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Get list of existing student numbers to prevent duplicates
    const existingStudentNumbers = existingStudents.map(s => s.studenNo);

    // Validate each student in the form
    formData.students.forEach((student, index) => {
      // Validate student number is present
      if (!student.studenNo.trim()) {
        setError(`${index}_studenNo` as keyof StudentFormState, 'Studienummer er påkrævet');
        isValid = false;
      } 
      // Check if student number already exists in the exam
      else if (existingStudentNumbers.includes(student.studenNo.trim())) {
        setError(`${index}_studenNo` as keyof StudentFormState, 'Dette studienummer findes allerede');
        isValid = false;
      }

      // Validate first name is present
      if (!student.firstName.trim()) {
        setError(`${index}_firstName` as keyof StudentFormState, 'Fornavn er påkrævet');
        isValid = false;
      }

      // Validate last name is present
      if (!student.lastName.trim()) {
        setError(`${index}_lastName` as keyof StudentFormState, 'Efternavn er påkrævet');
        isValid = false;
      }
    });

    // Check for duplicate student numbers within the form itself
    const studentNumbers = formData.students.map(s => s.studenNo.trim()).filter(Boolean);
    const duplicates = studentNumbers.filter((num, index) => studentNumbers.indexOf(num) !== index);
    
    // Mark all instances of duplicate numbers as errors
    duplicates.forEach(duplicate => {
      formData.students.forEach((student, index) => {
        if (student.studenNo.trim() === duplicate) {
          setError(`${index}_studenNo` as keyof StudentFormState, 'Studienummer må ikke være ens');
          isValid = false;
        }
      });
    });

    return isValid;
  };

  // Form submission handler that creates all students
  const onSubmit = async (data: StudentFormState) => {
    // Run validation before attempting submission
    if (!validateForm()) {
      return;
    }

    try {
      // Create students sequentially to maintain order
      // This preserves the intended examination sequence
      for (let i = 0; i < data.students.length; i++) {
        const student = data.students[i];
        
        // Prepare student data for API call
        const studentData = {
          exam: exam.id,                        // Link to current exam
          studenNo: student.studenNo.trim(),    // Clean student number
          firstName: student.firstName.trim(),  // Clean first name
          lastName: student.lastName.trim(),    // Clean last name
          // Question numbers will be assigned during examination
        };

        // Create student via API
        const createdStudent = await createStudent(studentData);
        
        // If successful, add to local state
        if (createdStudent) {
          handleStudentAdded(createdStudent);
        }
      }
      
      // Close the form after successful submission
      handleStudentFormCancel();
    } catch (error) {
      // Log error for debugging
      console.error('Fejl ved oprettelse af studerende:', error);
      // In production, this might show user-friendly error message
    }
  };

  return (
    // Card wrapper for consistent styling
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        {/* Clear title and helpful description */}
        <CardTitle>Tilføj studerende</CardTitle>
        <CardDescription>
          Indtast studienummer og navn på studerende i den rækkefølge de skal eksamineres i
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Form with proper submission handling */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Dynamic list of student input rows */}
            {formData.students.map((student, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                {/* Row header with remove button */}
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Studerende {index + 1}</h4>
                  
                  {/* Only show remove button if multiple students exist */}
                  {formData.students.length > 1 && (
                    <Button
                      type="button"                           // Prevent form submission
                      variant="outline"                       // Secondary styling
                      size="sm"                               // Compact size
                      onClick={() => removeStudentRow(index)} // Remove this row
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Student input fields in responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Student number field */}
                  <div className="space-y-2">
                    <Label htmlFor={`studenNo-${index}`}>Studienummer</Label>
                    <Input
                      id={`studenNo-${index}`}                          // Unique ID for accessibility
                      type="text"
                      placeholder="f.eks. 123456"                      // Example guidance
                      value={student.studenNo}                         // Controlled value
                      onChange={(e) => updateStudent(index, 'studenNo', e.target.value)} // Update handler
                      aria-invalid={!!errors[`${index}_studenNo`]}     // Accessibility for errors
                    />
                    {/* Conditional error display */}
                    {errors[`${index}_studenNo`] && (
                      <p className="text-sm text-destructive">{errors[`${index}_studenNo`]}</p>
                    )}
                  </div>

                  {/* First name field */}
                  <div className="space-y-2">
                    <Label htmlFor={`firstName-${index}`}>Fornavn</Label>
                    <Input
                      id={`firstName-${index}`}
                      type="text"
                      placeholder="f.eks. Alice"
                      value={student.firstName}
                      onChange={(e) => updateStudent(index, 'firstName', e.target.value)}
                      aria-invalid={!!errors[`${index}_firstName`]}
                    />
                    {errors[`${index}_firstName`] && (
                      <p className="text-sm text-destructive">{errors[`${index}_firstName`]}</p>
                    )}
                  </div>

                  {/* Last name field */}
                  <div className="space-y-2">
                    <Label htmlFor={`lastName-${index}`}>Efternavn</Label>
                    <Input
                      id={`lastName-${index}`}
                      type="text"
                      placeholder="f.eks. Andersen"
                      value={student.lastName}
                      onChange={(e) => updateStudent(index, 'lastName', e.target.value)}
                      aria-invalid={!!errors[`${index}_lastName`]}
                    />
                    {errors[`${index}_lastName`] && (
                      <p className="text-sm text-destructive">{errors[`${index}_lastName`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form controls section */}
          <div className="flex justify-between items-center">
            {/* Add more students button */}
            <Button 
              type="button"                 // Prevent form submission
              variant="outline"             // Secondary styling
              onClick={addStudentRow}       // Add new student row
              className="gap-2"             // Icon spacing
            >
              <Plus className="h-4 w-4" />
              Tilføj flere studerende
            </Button>
            
            {/* Form action buttons */}
            <div className="flex gap-4">
              {/* Cancel button */}
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleStudentFormCancel}
              >
                Annuller
              </Button>
              
              {/* Submit button with loading state */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Tilføjer...' : 'Tilføj studerende'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 