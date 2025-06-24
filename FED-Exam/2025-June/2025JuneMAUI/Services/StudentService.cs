using _2025JuneMAUI.Models;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Student service implementation handling business logic for student management
    // Encapsulates student-specific operations beyond basic CRUD functionality
    // Combines data access with validation, ordering, and statistical calculations
    public class StudentService : IStudentService
    {
        // Private readonly fields for dependency injection
        // IDataService provides abstracted database operations for students and exams
        private readonly IDataService _dataService;
        
        // IDialogService enables user interaction for confirmations and notifications
        private readonly IDialogService _dialogService;

        // Constructor using tuple deconstruction for concise dependency injection
        // Expression-bodied syntax assigns both dependencies in single statement
        public StudentService(IDataService dataService, IDialogService dialogService) => 
            (_dataService, _dialogService) = (dataService, dialogService);

        // Retrieve all students for specific exam with proper ordering
        // Delegates to data service which handles sorting by examination order
        public async Task<List<Student>> GetStudentsForExamAsync(int examId) => 
            await _dataService.GetStudentsByExamIdAsync(examId);

        // Create new student with validation and automatic order assignment
        // Returns created student object with database-assigned ID for immediate use
        public async Task<Student> CreateStudentAsync(int examId, string studentNo, string firstName, string lastName, int order)
        {
            // Create new student instance with provided data
            // Object initialization syntax provides clear property mapping
            var student = new Student
            {
                ExamId = examId,                // Link to specific exam
                StudentNo = studentNo,          // Official student identification
                FirstName = firstName,          // Student's given name
                LastName = lastName,            // Student's family name
                ExaminationOrder = order        // Position in examination sequence
            };
            
            // Insert student into database and notify user of success
            await _dataService.AddStudentAsync(student);
            await _dialogService.ShowAlertAsync("Succes", "Studerende tilføjet!");
            
            // Return created student for immediate use in calling code
            return student;
        }

        // Update existing student with new information
        // Preserves student ID while updating all other fields
        public async Task<Student> UpdateStudentAsync(int id, string studentNo, string firstName, string lastName, int order)
        {
            // Retrieve existing student to preserve other fields and validate existence
            var student = await _dataService.GetStudentAsync(id) ?? 
                throw new InvalidOperationException("Studerende ikke fundet");
            
            // Update student properties with new values
            // Tuple assignment syntax provides concise multi-property update
            (student.StudentNo, student.FirstName, student.LastName, student.ExaminationOrder) = 
                (studentNo, firstName, lastName, order);
            
            // Persist changes and notify user of successful update
            await _dataService.UpdateStudentAsync(student);
            await _dialogService.ShowAlertAsync("Succes", "Studerende opdateret!");
            
            // Return updated student object for immediate use
            return student;
        }

        // Delete student with confirmation dialog and success notification
        // Returns boolean indicating whether deletion was performed
        public async Task<bool> DeleteStudentAsync(int studentId)
        {
            // Retrieve student to get name for confirmation dialog
            var student = await _dataService.GetStudentAsync(studentId);
            if (student == null) return false;

            // Display confirmation dialog with student name for user clarity
            if (await _dialogService.ShowConfirmAsync("Bekræft", 
                $"Slet studerende '{student.FirstName} {student.LastName}'?"))
            {
                // Perform deletion and notify user of successful operation
                await _dataService.DeleteStudentAsync(student);
                await _dialogService.ShowAlertAsync("Succes", "Studerende slettet!");
                return true;
            }
            
            // Return false if user canceled or operation failed
            return false;
        }

        // Swap examination order between two students
        // Enables manual reordering of examination sequence
        public async Task SwapStudentOrdersAsync(int studentId1, int studentId2)
        {
            // Retrieve both students to validate existence and get current orders
            var student1 = await _dataService.GetStudentAsync(studentId1);
            var student2 = await _dataService.GetStudentAsync(studentId2);
            
            // Validate both students exist before attempting swap
            if (student1 != null && student2 != null)
            {
                // Swap examination order values between students
                // Tuple assignment provides atomic swap operation
                (student1.ExaminationOrder, student2.ExaminationOrder) = 
                    (student2.ExaminationOrder, student1.ExaminationOrder);
                
                // Update both students in database to persist the swap
                await _dataService.UpdateStudentAsync(student1);
                await _dataService.UpdateStudentAsync(student2);
            }
        }

        // Validate student data using centralized validation service
        // Returns boolean indicating whether all validation rules pass
        public async Task<bool> ValidateStudentDataAsync(int examId, string studentNo, string firstName, string lastName) =>
            // Delegate to ValidationService for consistent validation patterns
            // Static method call provides validation rules for student data
            await ValidationService.ValidateAsync(_dialogService, 
                ValidationService.GetStudentValidations(examId, studentNo, firstName, lastName));

        // Get next available examination order number for new student
        // Ensures proper sequencing when adding students to exam
        public async Task<int> GetNextOrderAsync(int examId) => 
            await _dataService.GetNextExaminationOrderAsync(examId);

        // Generate comprehensive statistics summary for an exam
        // Provides formatted string with progress and grade distribution information
        public async Task<string> GetExamStatsAsync(int examId)
        {
            // Get basic progress statistics from data service
            var total = await _dataService.GetTotalStudentsForExamAsync(examId);
            var completed = await _dataService.GetCompletedStudentsForExamAsync(examId);
            
            // Get detailed student list for grade calculations
            var students = await GetStudentsForExamAsync(examId);
            
            // Calculate completion percentage for progress tracking
            var completionPercentage = total > 0 ? (completed * 100.0 / total) : 0;
            
            // Build comprehensive statistics string with all relevant information
            return $"Total: {total} | Færdige: {completed} | Gennemført: {completionPercentage:F1}% | " +
                   $"Gennemsnit: {CalculateAverageGrade(students)}";
        }

        // Calculate average grade using static grade calculation service
        // Delegates to specialized service for consistent grade calculation logic
        public string CalculateAverageGrade(List<Student> students) => 
            GradeCalculationService.CalculateAverageGrade(students);

        // Get grade distribution using static grade calculation service
        // Delegates to specialized service for consistent grade distribution logic
        public Dictionary<string, int> GetGradeDistribution(List<Student> students) => 
            GradeCalculationService.GetGradeDistribution(students);
    }
} 