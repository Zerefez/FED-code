using SQLite;

namespace _2025JuneMAUI.Models
{
    // SQLite table attribute defines the table name in the database
    // This enables the ORM to map this C# class to a database table
    [Table("Exams")]
    public class Exam
    {
        // Primary key with auto-increment ensures unique identification
        // SQLite will automatically generate sequential IDs for new records
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        // Exam term/period identifier (e.g., "Sommer 2024", "Vinter 2023")
        // String type chosen for flexibility in naming conventions
        // Empty string default prevents null reference exceptions
        public string ExamTermin { get; set; } = string.Empty;
        
        // Course name for the examination subject
        // Descriptive field to identify what subject is being examined
        // Empty string default maintains consistency with string initialization pattern
        public string CourseName { get; set; } = string.Empty;
        
        // Date stored as string for simplicity and cross-platform compatibility
        // Could be DateTime but string allows for flexible date formatting
        // Avoids timezone complications in a single-user local application
        public string Date { get; set; } = string.Empty;
        
        // Total number of questions available for random selection
        // Integer type ensures only whole numbers can be specified
        // Used by the random question drawing algorithm
        public int NumberOfQuestions { get; set; }
        
        // Duration of each student's examination in minutes
        // Integer for simplicity - most exams are measured in whole minutes
        // Used for timer functionality and time tracking
        public int ExamDurationMinutes { get; set; }
        
        // Start time of the examination session
        // String format allows flexible time representation (e.g., "09:00", "13:30")
        // Could be TimeSpan but string is more user-friendly for input/display
        public string StartTime { get; set; } = string.Empty;
        
        // Timestamp when this exam record was created
        // Automatic initialization to current time for audit trail
        // Useful for sorting and tracking when exams were set up
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
} 