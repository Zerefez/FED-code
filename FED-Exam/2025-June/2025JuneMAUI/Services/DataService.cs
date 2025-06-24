using _2025JuneMAUI.Data;
using _2025JuneMAUI.Models;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Data service implementation providing abstraction layer over database operations
    // Acts as a facade pattern to simplify database access for business logic layers
    // Implements interface to enable dependency injection and testing with mock implementations
    public class DataService : IDataService
    {
        // Private readonly field holding the database instance
        // Readonly ensures the database reference cannot be changed after construction
        // Database is injected through constructor for proper dependency inversion
        private readonly Database _database;

        // Constructor accepting database dependency through dependency injection
        // Expression-bodied syntax provides concise initialization
        // Tuple deconstruction syntax assigns the parameter to the private field
        public DataService(Database database) => _database = database;

        // Exam operations section - direct delegation to database layer
        
        // Retrieve all exams by delegating to database implementation
        // Async/await pattern ensures non-blocking UI thread operation
        // Simple pass-through method maintains abstraction layer consistency
        public async Task<List<Exam>> GetExamsAsync() => await _database.GetExamsAsync();
        
        // Retrieve specific exam by ID through database delegation
        // Returns nullable Exam to handle cases where exam doesn't exist
        public async Task<Exam?> GetExamAsync(int id) => await _database.GetExamAsync(id);
        
        // Add new exam record through database delegation
        // Returns integer representing number of affected rows (should be 1)
        public async Task<int> AddExamAsync(Exam exam) => await _database.AddExamAsync(exam);
        
        // Update existing exam record through database delegation
        // Returns integer representing number of affected rows (should be 1)
        public async Task<int> UpdateExamAsync(Exam exam) => await _database.UpdateExamAsync(exam);
        
        // Delete exam record through database delegation
        // Includes cascading delete logic implemented in database layer
        public async Task<int> DeleteExamAsync(Exam exam) => await _database.DeleteExamAsync(exam);

        // Student operations section - direct delegation to database layer
        
        // Retrieve students for specific exam with proper ordering
        // Delegates to database method that handles sorting by examination order
        public async Task<List<Student>> GetStudentsByExamIdAsync(int examId) => await _database.GetStudentsByExamIdAsync(examId);
        
        // Retrieve specific student by ID through database delegation
        // Returns nullable Student to handle cases where student doesn't exist
        public async Task<Student?> GetStudentAsync(int id) => await _database.GetStudentAsync(id);
        
        // Add new student record through database delegation
        // Returns integer representing number of affected rows (should be 1)
        public async Task<int> AddStudentAsync(Student student) => await _database.AddStudentAsync(student);
        
        // Update existing student record through database delegation
        // Returns integer representing number of affected rows (should be 1)
        public async Task<int> UpdateStudentAsync(Student student) => await _database.UpdateStudentAsync(student);
        
        // Delete student record through database delegation
        // Returns integer representing number of affected rows (should be 1)
        public async Task<int> DeleteStudentAsync(Student student) => await _database.DeleteStudentAsync(student);

        // Utility operations section - statistical and helper methods
        
        // Get next examination order number for new student in specific exam
        // Delegates to database method that calculates proper sequence number
        public async Task<int> GetNextExaminationOrderAsync(int examId) => await _database.GetNextExaminationOrderAsync(examId);
        
        // Get total count of students registered for specific exam
        // Used for progress tracking and statistics display
        public async Task<int> GetTotalStudentsForExamAsync(int examId) => await _database.GetTotalStudentsForExamAsync(examId);
        
        // Get count of students who have completed examination (have grades)
        // Used for progress tracking and completion percentage calculations
        public async Task<int> GetCompletedStudentsForExamAsync(int examId) => await _database.GetCompletedStudentsForExamAsync(examId);

        // Calculate average grade for all students in specific exam
        // Delegates complex grade calculation logic to database layer
        // Returns double value representing numerical average of valid grades
        public async Task<double> GetExamAverageGradeAsync(int examId)
        {
            // Direct delegation to database implementation
            // Database handles filtering of valid grades and calculation logic
            return await _database.GetExamAverageGradeAsync(examId);
        }
    }
} 