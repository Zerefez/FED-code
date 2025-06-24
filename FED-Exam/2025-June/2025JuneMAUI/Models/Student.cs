using SQLite;

namespace _2025JuneMAUI.Models
{
    // SQLite table attribute maps this class to the "Students" database table
    // Enables automatic ORM operations for student data persistence
    [Table("Students")]
    public class Student
    {
        // Primary key with auto-increment for unique student identification
        // SQLite handles ID generation automatically, ensuring no duplicates
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        // Foreign key reference to the Exam table
        // Links each student to a specific examination session
        // Integer type matches the Exam.Id primary key for referential integrity
        public int ExamId { get; set; }
        
        // Official student identification number
        // String type accommodates various student numbering systems
        // Empty string default prevents null reference issues during data binding
        public string StudentNo { get; set; } = string.Empty;
        
        // Student's first/given name
        // Separate from last name for flexible name handling and sorting
        // Empty string default ensures safe string operations
        public string FirstName { get; set; } = string.Empty;
        
        // Student's last/family name
        // Stored separately for proper name formatting and alphabetical sorting
        // Empty string default maintains consistency with other string properties
        public string LastName { get; set; } = string.Empty;
        
        // The specific question number assigned to this student
        // Generated randomly during the examination process
        // Integer type ensures only valid question numbers can be stored
        public int QuestionNo { get; set; }
        
        // Actual duration this student spent on the examination
        // Measured in minutes and recorded when examination is completed
        // May differ from the planned exam duration based on actual performance
        public int ExamDurationMinutes { get; set; }
        
        // Examiner's notes about the student's performance
        // Text field for qualitative observations and comments
        // Empty string default allows for optional note-taking
        public string Notes { get; set; } = string.Empty;
        
        // Final grade assigned to the student
        // String type accommodates different grading systems (letters, numbers, etc.)
        // Empty string indicates the student hasn't been graded yet
        public string Grade { get; set; } = string.Empty;
        
        // Order in which students should be examined
        // Allows for predetermined examination sequence
        // Can be used for scheduling and organizing the examination process
        public int ExaminationOrder { get; set; }
        
        // Timestamp when this student record was created
        // Automatic initialization provides audit trail
        // Useful for tracking when students were added to an exam
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
} 