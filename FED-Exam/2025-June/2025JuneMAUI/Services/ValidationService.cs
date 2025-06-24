using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Static validation service providing centralized validation logic
    // Uses static methods to avoid dependency injection overhead for pure validation logic
    // Provides reusable validation patterns with consistent user feedback
    public static class ValidationService
    {
        // Generic validation method that processes multiple validation rules
        // Returns boolean indicating overall validation success/failure
        // Displays first validation error to user through dialog service
        public static async Task<bool> ValidateAsync(IDialogService dialogService, params (bool isInvalid, string message)[] validations)
        {
            // Iterate through provided validation rules to find first failure
            foreach (var (isInvalid, message) in validations)
            {
                // If validation rule fails, display error message and return false
                if (isInvalid)
                {
                    // Show user-friendly error dialog with validation message
                    // Danish "Valideringsfejl" means "Validation Error"
                    await dialogService.ShowAlertAsync("Valideringsfejl", message);
                    
                    // Return false immediately on first validation failure
                    // Fail-fast approach prevents multiple error dialogs
                    return false;
                }
            }
            
            // Return true if all validation rules passed
            // Indicates data is valid and operation can proceed
            return true;
        }

        // Generate validation rules for exam data
        // Returns array of validation tuples for use with ValidateAsync method
        // Encapsulates all business rules for exam creation/updating
        public static (bool isInvalid, string message)[] GetExamValidations(string termim, string courseName, int questions, int duration) =>
            new[]
            {
                // Validate exam term is not empty
                // Term identification is required for exam organization
                (string.IsNullOrWhiteSpace(termim), "Eksamen termin må ikke være tom"),
                
                // Validate course name is not empty
                // Course name is essential for identifying the subject matter
                (string.IsNullOrWhiteSpace(courseName), "Kursus navn må ikke være tom"),
                
                // Validate question count is positive
                // Must have at least one question for meaningful examination
                (questions <= 0, "Antal spørgsmål skal være større end 0"),
                
                // Validate duration is positive
                // Must have positive time allocation for student examination
                (duration <= 0, "Eksamen varighed skal være større end 0 minutter")
            };

        // Generate validation rules for student data
        // Returns array of validation tuples for use with ValidateAsync method
        // Encapsulates all business rules for student creation/updating
        public static (bool isInvalid, string message)[] GetStudentValidations(int examId, string studentNo, string firstName, string lastName) =>
            new[]
            {
                // Validate exam ID is positive
                // Student must be associated with a valid exam
                (examId <= 0, "Eksamen ID skal være gyldig"),
                
                // Validate student number is not empty
                // Student identification number is required for academic records
                (string.IsNullOrWhiteSpace(studentNo), "Studerende nummer må ikke være tom"),
                
                // Validate first name is not empty  
                // First name is required for student identification
                (string.IsNullOrWhiteSpace(firstName), "Fornavn må ikke være tom"),
                
                // Validate last name is not empty
                // Last name is required for complete student identification
                (string.IsNullOrWhiteSpace(lastName), "Efternavn må ikke være tom")
            };
    }
} 