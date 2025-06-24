using _2025JuneMAUI.Models;
using SQLite;

namespace _2025JuneMAUI.Data
{
    public class Database
    {
        // Private field storing the asynchronous SQLite connection
        // Nullable to handle initialization failures gracefully
        // Readonly ensures connection instance cannot be reassigned after construction
        private readonly SQLiteAsyncConnection? _connection;
        
        // Task representing the asynchronous database initialization process
        // Allows other methods to await initialization completion before proceeding
        // Readonly prevents reassignment after constructor completes
        private readonly Task _initializationTask;
        
        // Boolean flag tracking whether database initialization has completed successfully
        // Prevents duplicate initialization attempts and validates database readiness
        private bool _isInitialized = false;
        
        // Database constructor handles connection setup and initialization
        // Uses try-catch to gracefully handle potential initialization failures
        public Database()
        {
            try
            {
                // Get the platform-specific application data directory
                // MAUI's FileSystem.AppDataDirectory resolves to appropriate locations per platform
                var dataDir = FileSystem.AppDataDirectory;
                
                // Ensure the data directory exists before creating database file
                // Creates directory if missing to prevent file creation failures
                if (!Directory.Exists(dataDir))
                {
                    Directory.CreateDirectory(dataDir);
                }
                
                // Construct full path to the SQLite database file
                // Combines platform-specific directory with standardized filename
                var databasePath = Path.Combine(dataDir, "ExamManagement.db");
                
                // Configure SQLite connection options with DateTime tick storage
                // storeDateTimeAsTicks: true optimizes DateTime storage and retrieval performance
                var dbOptions = new SQLiteConnectionString(databasePath, true);
                
                // Create the asynchronous SQLite connection instance
                // AsyncConnection enables non-blocking database operations for UI responsiveness
                _connection = new SQLiteAsyncConnection(dbOptions);
                
                // Start the asynchronous initialization process
                // InitializeAsync creates tables and performs setup without blocking constructor
                _initializationTask = InitializeAsync();
            }
            catch (Exception ex)
            {
                // Log initialization errors for debugging purposes
                // Uses Debug.WriteLine to output errors during development
                System.Diagnostics.Debug.WriteLine($"Database initialization error: {ex.Message}");
                
                // Create a failed task to propagate the exception to awaiting methods
                // Ensures that database operation attempts will fail fast with meaningful errors
                _initializationTask = Task.FromException(ex);
                
                // Re-throw exception to indicate constructor failure
                // Allows dependency injection container to handle the failure appropriately
                throw;
            }
        }
        
        // Private asynchronous method to perform database table creation
        // Separated from constructor to enable proper async/await patterns
        private async Task InitializeAsync()
        {
            try
            {
                // Validate that connection was successfully created
                // Guards against null connection due to initialization failures
                if (_connection == null)
                    throw new InvalidOperationException("Database connection is null");
                    
                // Create table for Exam entities if it doesn't exist
                // CreateTableAsync is idempotent - safe to call multiple times
                await _connection.CreateTableAsync<Exam>();
                
                // Create table for Student entities with proper schema
                // Establishes the database structure for student data persistence
                await _connection.CreateTableAsync<Student>();
                
                // Create table for ExamSession entities for session tracking
                // Enables persistent storage of examination session state
                await _connection.CreateTableAsync<ExamSession>();
                
                // Set initialization flag to true indicating successful completion
                // Allows other methods to proceed with database operations
                _isInitialized = true;
            }
            catch (Exception ex)
            {
                // Log table creation errors with context information
                // Helps diagnose schema creation issues during development
                System.Diagnostics.Debug.WriteLine($"Database table creation error: {ex.Message}");
                
                // Re-throw exception to propagate failure to calling code
                // Ensures initialization failures are not silently ignored
                throw;
            }
        }

        // Generic method wrapper for executing database operations safely
        // Ensures initialization completion and provides consistent error handling
        // Returns default value if connection is null to prevent exceptions
        private async Task<T> ExecuteAsync<T>(Func<SQLiteAsyncConnection, Task<T>> operation, T defaultValue = default!)
        {
            // Wait for database initialization to complete before proceeding
            // Ensures all tables are created and database is ready for operations
            await EnsureInitializedAsync();
            
            // Return default value if connection is null (initialization failed)
            // Provides graceful degradation instead of throwing null reference exceptions
            if (_connection == null) return defaultValue;
            
            // Execute the provided database operation with the validated connection
            // Delegates actual database work to the calling method's lambda expression
            return await operation(_connection);
        }

        // Private method to validate database initialization status
        // Ensures database is ready before attempting any operations
        private async Task EnsureInitializedAsync()
        {
            try
            {
                // Wait for the initialization task to complete
                // Blocks until database setup is finished or fails
                await _initializationTask;
                
                // Verify that initialization actually succeeded
                // Double-checks the success flag in case of edge cases
                if (!_isInitialized)
                    throw new InvalidOperationException("Database failed to initialize");
                    
                // Validate that connection is available for use
                // Final safety check before allowing database operations
                if (_connection == null)
                    throw new InvalidOperationException("Database connection is null");
            }
            catch (Exception ex)
            {
                // Log initialization validation errors with context
                // Helps diagnose persistent initialization issues
                System.Diagnostics.Debug.WriteLine($"Database ensure initialized error: {ex.Message}");
                
                // Re-throw to prevent operations on uninitialized database
                // Maintains application stability by failing fast
                throw;
            }
        }

        // Exam CRUD operations section
        
        // Retrieve all exam records from the database
        // Returns empty list as default value if operation fails
        public async Task<List<Exam>> GetExamsAsync() => 
            await ExecuteAsync(conn => conn.Table<Exam>().ToListAsync(), new List<Exam>());

        // Retrieve a specific exam by its unique identifier
        // Returns null if exam is not found or operation fails
        public async Task<Exam?> GetExamAsync(int id) => 
            await ExecuteAsync(conn => conn.Table<Exam>().Where(e => e.Id == id).FirstOrDefaultAsync());

        // Insert a new exam record into the database
        // Returns the number of affected rows (should be 1 for successful insert)
        public async Task<int> AddExamAsync(Exam exam) => 
            await ExecuteAsync(conn => conn.InsertAsync(exam));

        // Delete an exam and all associated students from the database
        // Implements cascading delete to maintain referential integrity
        public async Task<int> DeleteExamAsync(Exam exam) => 
            await ExecuteAsync(async conn => {
                // First retrieve all students associated with this exam
                // Necessary for manual cascading delete since SQLite doesn't enforce foreign keys
                var students = await GetStudentsByExamIdAsync(exam.Id);
                
                // Delete each associated student record individually
                // Ensures complete cleanup of dependent data
                foreach (var student in students)
                {
                    await conn.DeleteAsync(student);
                }
                
                // Finally delete the exam record itself
                // Returns the count of deleted exam records
                return await conn.DeleteAsync(exam);
            });

        // Update an existing exam record with new values
        // Returns the number of affected rows (should be 1 for successful update)
        public async Task<int> UpdateExamAsync(Exam exam) => 
            await ExecuteAsync(conn => conn.UpdateAsync(exam));

        // Student CRUD operations section
        
        // Retrieve all student records from the database
        // Returns empty list as default value if operation fails
        public async Task<List<Student>> GetStudentsAsync() => 
            await ExecuteAsync(conn => conn.Table<Student>().ToListAsync(), new List<Student>());

        // Retrieve students for a specific exam, ordered by examination sequence
        // Orders by ExaminationOrder first, then by CreatedAt for consistent sorting
        public async Task<List<Student>> GetStudentsByExamIdAsync(int examId) => 
            await ExecuteAsync(conn => conn.Table<Student>()
                .Where(s => s.ExamId == examId)
                .OrderBy(s => s.ExaminationOrder)
                .ThenBy(s => s.CreatedAt)
                .ToListAsync(), new List<Student>());

        // Retrieve a specific student by their unique identifier
        // Returns null if student is not found or operation fails
        public async Task<Student?> GetStudentAsync(int id) => 
            await ExecuteAsync(conn => conn.Table<Student>().Where(s => s.Id == id).FirstOrDefaultAsync());

        // Insert a new student record into the database
        // Returns the number of affected rows (should be 1 for successful insert)
        public async Task<int> AddStudentAsync(Student student) => 
            await ExecuteAsync(conn => conn.InsertAsync(student));

        // Delete a specific student record from the database
        // Returns the number of affected rows (should be 1 for successful delete)
        public async Task<int> DeleteStudentAsync(Student student) => 
            await ExecuteAsync(conn => conn.DeleteAsync(student));

        // Update an existing student record with new values
        // Returns the number of affected rows (should be 1 for successful update)
        public async Task<int> UpdateStudentAsync(Student student) => 
            await ExecuteAsync(conn => conn.UpdateAsync(student));

        // Additional utility methods section
        
        // Calculate the average grade for students in a specific exam
        // Filters out empty grades and parses numeric values for calculation
        public async Task<double> GetExamAverageGradeAsync(int examId)
        {
            // Retrieve all students for the specified exam
            var students = await GetStudentsByExamIdAsync(examId);
            
            // Filter students with valid grades and convert to numeric values
            // Only includes grades that are not null/empty and can be parsed as doubles
            var gradesWithValues = students
                .Where(s => !string.IsNullOrEmpty(s.Grade) && double.TryParse(s.Grade, out _))
                .Select(s => double.Parse(s.Grade))
                .ToList();

            // Return average if grades exist, otherwise return 0.0
            // Prevents division by zero when no valid grades are present
            return gradesWithValues.Any() ? gradesWithValues.Average() : 0.0;
        }

        // Count total number of students registered for a specific exam
        // Useful for progress tracking and exam statistics
        public async Task<int> GetTotalStudentsForExamAsync(int examId) => 
            await ExecuteAsync(conn => conn.Table<Student>().Where(s => s.ExamId == examId).CountAsync());

        // Count students who have completed their examination (have grades)
        // Used for progress tracking and completion statistics
        public async Task<int> GetCompletedStudentsForExamAsync(int examId) => 
            await ExecuteAsync(conn => conn.Table<Student>()
                .Where(s => s.ExamId == examId && !string.IsNullOrEmpty(s.Grade))
                .CountAsync());

        // Calculate the next examination order number for a new student
        // Ensures proper sequencing when adding students to an exam
        public async Task<int> GetNextExaminationOrderAsync(int examId)
        {
            // Retrieve all students for the exam to find the highest order number
            var students = await GetStudentsByExamIdAsync(examId);
            
            // Return the next sequential order number, or 1 if no students exist
            // Max() + 1 ensures new students are added at the end of the sequence
            return students.Any() ? students.Max(s => s.ExaminationOrder) + 1 : 1;
        }
    }
}