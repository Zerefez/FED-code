using SQLite;

namespace JanuarMAUI.Models;

[Table("HabitEntries")]
public class HabitEntry
{
    [PrimaryKey, AutoIncrement]
    public long HabitEntryId { get; set; }
    
    [Indexed]
    public long HabitId { get; set; }
    
    [Indexed]
    public DateTime Date { get; set; }
    
    public bool Completed { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // Navigation property (not stored in DB)
    [Ignore]
    public Habit? Habit { get; set; }
} 