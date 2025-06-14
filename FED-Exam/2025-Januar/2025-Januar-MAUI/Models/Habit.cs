using SQLite;
using System.ComponentModel.DataAnnotations;

namespace JanuarMAUI.Models;

[Table("Habits")]
public class Habit
{
    [PrimaryKey, AutoIncrement]
    public long HabitId { get; set; }
    
    [Required]
    [SQLite.MaxLength(100)]
    public string? Name { get; set; }
    
    [Required]
    [SQLite.MaxLength(500)]
    public string? Description { get; set; }
    
    public DateTime StartDate { get; set; }
    
    public long LongestStreak { get; set; }
    
    public long CurrentStreak { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // UI Helper Properties (not stored in DB)
    [Ignore]
    public bool IsCompletedToday { get; set; }
} 