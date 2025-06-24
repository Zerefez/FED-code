using _2025JuneMAUI.Models;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Exam service implementation encapsulating business logic for exam management
    // Provides higher-level operations beyond simple CRUD by combining data operations with validation
    // Implements interface pattern for dependency injection and testability
    public class ExamService : IExamService
    {
        // Private readonly fields for injected dependencies
        // IDataService provides data access abstraction for exam and student operations
        private readonly IDataService _dataService;
        
        // IDialogService enables user interaction for validation failures and confirmations
        private readonly IDialogService _dialogService;

        // Constructor using tuple deconstruction for concise dependency injection
        // Expression-bodied syntax assigns both dependencies in a single statement
        // Readonly fields ensure dependencies cannot be reassigned after construction
        public ExamService(IDataService dataService, IDialogService dialogService) => 
            (_dataService, _dialogService) = (dataService, dialogService);

        // Retrieve all exams with simple delegation to data service
        // Async method ensures non-blocking operation for UI responsiveness
        // No additional business logic required for simple data retrieval
        public async Task<List<Exam>> GetAllExamsAsync() => await _dataService.GetExamsAsync();

        // Create new exam with comprehensive data validation and business logic
        // Accepts all exam parameters individually for clear method signature
        // Returns newly created exam object with assigned ID for immediate use
        public async Task<Exam> CreateExamAsync(string termim, string courseName, string date, int questions, int duration, string startTime)
        {
            // Create new exam instance with provided parameters
            // Object initialization syntax provides clear property assignment
            var exam = new Exam
            {
                ExamTermin = termim,          // Assign exam term/period
                CourseName = courseName,      // Assign course name
                Date = date,                  // Assign examination date
                NumberOfQuestions = questions, // Assign total question count
                ExamDurationMinutes = duration, // Assign duration per student
                StartTime = startTime         // Assign session start time
            };
            
            // Insert exam into database and return the created object
            // AddExamAsync returns affected row count, but we return the exam object
            await _dataService.AddExamAsync(exam);
            await _dialogService.ShowAlertAsync("Succes", "Eksamen oprettet!");
            return exam;
        }

        // Update existing exam with validation and business logic
        // Requires exam ID to identify the record to update
        // Returns updated exam object for immediate use in calling code
        public async Task<Exam> UpdateExamAsync(int id, string termim, string courseName, string date, int questions, int duration, string startTime)
        {
            // Create exam object with updated values and existing ID
            // ID assignment ensures update operation targets correct record
            var exam = new Exam
            {
                Id = id,                      // Preserve existing exam ID
                ExamTermin = termim,          // Update exam term/period
                CourseName = courseName,      // Update course name
                Date = date,                  // Update examination date
                NumberOfQuestions = questions, // Update total question count
                ExamDurationMinutes = duration, // Update duration per student
                StartTime = startTime         // Update session start time
            };
            
            // Perform database update and return the updated object
            // UpdateExamAsync returns affected row count, but we return the exam object
            await _dataService.UpdateExamAsync(exam);
            await _dialogService.ShowAlertAsync("Succes", "Eksamen opdateret!");
            return exam;
        }

        // Delete exam with confirmation dialog and business logic validation
        // Returns boolean indicating success/failure for UI feedback
        // Includes user confirmation to prevent accidental deletions
        public async Task<bool> DeleteExamAsync(int examId)
        {
            // Retrieve the exam to be deleted for validation and confirmation
            // Null check ensures exam exists before attempting deletion
            var exam = await _dataService.GetExamAsync(examId);
            if (exam == null) return false;

            // Check for associated students that would be affected by deletion
            // Student count helps inform user about the impact of deletion
            var studentCount = await _dataService.GetTotalStudentsForExamAsync(examId);
            
            // Construct confirmation message based on whether students are associated
            // Dynamic message provides specific information about deletion consequences
            var message = studentCount > 0 
                ? $"Er du sikker på at du vil slette eksamen '{exam.CourseName}'? Dette vil også slette {studentCount} tilknyttede studerende."
                : $"Er du sikker på at du vil slette eksamen '{exam.CourseName}'?";

            // Display confirmation dialog and proceed only if user confirms
            // Boolean return from ShowConfirmAsync determines whether to proceed
            if (await _dialogService.ShowConfirmAsync("Bekræft Sletning", message))
            {
                // Perform deletion and return true indicating successful operation
                // DeleteExamAsync handles cascading deletion of associated students
                await _dataService.DeleteExamAsync(exam);
                await _dialogService.ShowAlertAsync("Succes", "Eksamen slettet!");
                return true;
            }
            
            // Return false if user canceled deletion or operation failed
            return false;
        }

        // Validate exam data using centralized validation service
        // Returns boolean indicating whether all validation rules pass
        // Separates validation logic for reusability and maintainability
        public async Task<bool> ValidateExamDataAsync(string termim, string courseName, int questions, int duration) =>
            // Delegate to ValidationService which handles UI interaction for validation failures
            // Static method call avoids need for additional dependency injection
            await ValidationService.ValidateAsync(_dialogService, 
                // Pass validation rules as parameter array for flexible validation composition
                ValidationService.GetExamValidations(termim, courseName, questions, duration));
    }
} 