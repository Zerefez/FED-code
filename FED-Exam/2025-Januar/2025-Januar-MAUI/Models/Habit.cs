using SQLite;
using System.ComponentModel.DataAnnotations;
using CommunityToolkit.Mvvm.ComponentModel;

namespace JanuarMAUI.Models;

[Table("Habits")]
public partial class Habit : ObservableObject
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
    private bool _isCompletedToday;
    [Ignore]
    public bool IsCompletedToday 
    { 
        get => _isCompletedToday; 
        set => SetProperty(ref _isCompletedToday, value); 
    }
    
    private bool _isMarkedToday;
    [Ignore]
    public bool IsMarkedToday 
    { 
        get => _isMarkedToday; 
        set => SetProperty(ref _isMarkedToday, value); 
    }
    
    private string? _todayReason;
    [Ignore]
    public string? TodayReason 
    { 
        get => _todayReason; 
        set => SetProperty(ref _todayReason, value); 
    }
} 