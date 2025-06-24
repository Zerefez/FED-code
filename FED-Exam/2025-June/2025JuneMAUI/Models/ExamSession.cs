using SQLite;

namespace _2025JuneMAUI.Models
{
    // SQLite table attribute defines the database table for exam session tracking
    // This model tracks the state and progress of active examination sessions
    [Table("ExamSessions")]
    public class ExamSession
    {
        // Primary key with auto-increment for unique session identification
        // Each examination session gets a unique identifier for tracking
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        // Foreign key linking this session to a specific exam
        // Establishes which exam configuration this session is executing
        // Integer type matches Exam.Id for proper relational integrity
        public int ExamId { get; set; }
        
        // Index of the current student being examined
        // Zero-based indexing to match collection patterns in C#
        // Allows resuming examinations from the correct student position
        public int CurrentStudentIndex { get; set; } = 0;
        
        // Boolean flag indicating if this session is currently active
        // Prevents multiple simultaneous sessions and enables pause/resume functionality
        // Default true for newly created sessions
        public bool IsActive { get; set; } = true;
        
        // Timestamp when the examination session was initiated
        // Automatic initialization captures the exact start time
        // Useful for session duration calculations and audit trails
        public DateTime StartedAt { get; set; } = DateTime.Now;
        
        // Optional timestamp for when the session was completed
        // Nullable DateTime allows for incomplete/ongoing sessions
        // Set when all students have been examined or session is manually ended
        public DateTime? CompletedAt { get; set; }
        
        // Text description of the current session state
        // Provides human-readable status information beyond boolean flags
        // Default "Active" status for new sessions, can be "Paused" or "Completed"
        public string Status { get; set; } = "Active";
    }
} 