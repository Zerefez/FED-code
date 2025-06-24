using _2025JuneMAUI.Models;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Exam session service managing the active examination process and workflow
    // Encapsulates business logic for conducting examinations and managing student progression
    // Combines data operations with examination-specific business rules and calculations
    public class ExamSessionService : IExamSessionService
    {
        // Private readonly fields for dependency injection
        // IDataService provides access to exam and student data operations
        private readonly IDataService _dataService;
        
        // IDialogService enables user interaction for validation and error handling
        private readonly IDialogService _dialogService;
        
        // Random number generator for question selection
        // Instance field ensures consistent randomization throughout service lifetime
        private readonly Random _random = new();
        
        // Danish grading scale array for grade selection
        // Readonly array prevents modification and provides consistent grade options
        private readonly string[] _danishGrades = { "-3", "00", "02", "4", "7", "10", "12" };

        // Constructor using tuple deconstruction for dependency injection
        // Expression-bodied syntax provides concise initialization of dependencies
        public ExamSessionService(IDataService dataService, IDialogService dialogService) => 
            (_dataService, _dialogService) = (dataService, dialogService);

        // Retrieve students for specific exam with proper ordering
        // Delegates to data service which handles sorting by examination order
        public async Task<List<Student>> GetStudentsForExamAsync(int examId) => 
            await _dataService.GetStudentsByExamIdAsync(examId);

        // Get current student based on exam ID and current index position
        // Handles bounds checking and returns null for invalid indices
        public async Task<Student?> GetCurrentStudentAsync(int examId, int currentIndex)
        {
            // Retrieve ordered list of students for the exam
            var students = await GetStudentsForExamAsync(examId);
            
            // Return student at current index, or null if index is out of bounds
            // Bounds checking prevents index out of range exceptions
            return currentIndex >= 0 && currentIndex < students.Count ? students[currentIndex] : null;
        }

        // Find the first student who hasn't completed their examination
        // Returns null if all students have completed or no students exist
        public async Task<Student?> FindFirstUncompletedStudentAsync(int examId) => 
            // LINQ query filters students without grades (uncompleted) and takes first
            // FirstOrDefault returns null if no uncompleted students are found
            (await GetStudentsForExamAsync(examId)).FirstOrDefault(s => string.IsNullOrEmpty(s.Grade));

        // Generate random question number within specified range
        // Uses instance Random for consistent behavior throughout service lifetime
        public int DrawRandomQuestion(int maxQuestions) => _random.Next(1, maxQuestions + 1);
        
        // Return available grades for selection
        // Provides consistent grade options based on Danish grading system
        public string[] GetAvailableGrades() => _danishGrades;
        
        // Format time in minutes and seconds (MM:SS) format
        // Ensures consistent time display throughout the application
        public string FormatTime(int totalSeconds) => $"{totalSeconds / 60:D2}:{totalSeconds % 60:D2}";

        // Determine timer color based on remaining time percentage
        // Provides visual feedback for time urgency using color psychology
        public string GetTimerColor(int remainingSeconds, int totalDurationSeconds)
        {
            // Calculate ratio of remaining time to total time
            var ratio = (double)remainingSeconds / totalDurationSeconds;
            
            // Return color based on time remaining using switch expression
            // Green for >50%, Orange for 25-50%, Red for <25%
            return ratio switch
            {
                > 0.5 => "#22C55E",    // Green - plenty of time remaining
                > 0.25 => "#F59E0B",   // Orange - moderate time pressure
                _ => "#DC2626"         // Red - urgent time pressure
            };
        }

        // Save complete examination data for a student
        // Updates all examination-related fields in a single operation
        public async Task SaveStudentExamDataAsync(Student student, int questionNumber, int actualTimeMinutes, string notes, string grade)
        {
            // Update student object with examination results
            student.QuestionNo = questionNumber;           // Question assigned to student
            student.ExamDurationMinutes = actualTimeMinutes; // Actual time spent
            student.Notes = notes;                         // Examiner's notes
            student.Grade = grade;                         // Final grade assigned
            
            // Persist updated student data to database
            await _dataService.UpdateStudentAsync(student);
            await _dialogService.ShowAlertAsync("Gemt", $"Data gemt for {student.FirstName} {student.LastName}");
        }

        // Get comprehensive progress information for an exam
        // Returns tuple with total students, completed count, and formatted statistics
        public async Task<(int Total, int Completed, string Stats)> GetExamProgressAsync(int examId)
        {
            // Get total and completed student counts from data service
            var total = await _dataService.GetTotalStudentsForExamAsync(examId);
            var completed = await _dataService.GetCompletedStudentsForExamAsync(examId);
            
            // Format progress statistics as readable string
            var stats = $"{completed}/{total} studerende færdige";
            
            // Return structured data as named tuple for easy access
            return (total, completed, stats);
        }

        // Check if a student has completed their examination
        // Simple business rule: student is completed if they have a grade
        public bool IsStudentCompleted(Student student) => !string.IsNullOrEmpty(student.Grade);

        // Generate formatted summary of student's examination results
        // Provides human-readable overview of student performance
        public async Task<string> GetStudentSummaryAsync(Student student)
        {
            var exam = await _dataService.GetExamAsync(student.ExamId);
            return $"""
                ✅ EKSAMEN GENNEMFØRT
                
                {student.FirstName} {student.LastName}
                Studienummer: {student.StudentNo}
                
                📝 Eksamen: {exam?.CourseName ?? "Ukendt"}
                🎯 Spørgsmål: {student.QuestionNo}
                ⏱️ Tid: {student.ExamDurationMinutes} min
                📊 Karakter: {student.Grade}
                
                📋 Noter:
                {(string.IsNullOrEmpty(student.Notes) ? "Ingen noter" : student.Notes)}
                """;
        }

        // Check if any students remain uncompleted for an exam
        // Used to determine if examination session can be marked as finished
        public async Task<bool> HasUncompletedStudentsAsync(int examId) => 
            // Any() with predicate checks if at least one student lacks a grade
            (await GetStudentsForExamAsync(examId)).Any(s => string.IsNullOrEmpty(s.Grade));

        // Generate comprehensive completion summary for an exam
        // Provides overview of examination results and statistics
        public async Task<string> GetExamCompletionSummaryAsync(int examId)
        {
            var students = await GetStudentsForExamAsync(examId);
            var completedStudents = students.Where(s => !string.IsNullOrEmpty(s.Grade)).ToList();
            var average = GradeCalculationService.CalculateNumericalAverage(students);
            var distribution = GradeCalculationService.GetGradeDistribution(students);
            
            return $"""
                🎉 EKSAMEN AFSLUTTET
                
                📊 Status: {completedStudents.Count}/{students.Count} gennemført
                📈 Gennemsnit: {average:F1}
                
                📋 Karakterfordeling:
                {string.Join("\n", distribution.Where(kvp => kvp.Value > 0).Select(kvp => $"  {kvp.Key}: {kvp.Value}"))}
                """;
        }
    }
} 