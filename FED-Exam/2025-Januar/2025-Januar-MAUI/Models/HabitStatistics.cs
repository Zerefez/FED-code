namespace JanuarMAUI.Models;

public class HabitStatistics
{
    public long HabitId { get; set; }
    public string HabitName { get; set; } = string.Empty;
    public long CurrentStreak { get; set; }
    public long LongestStreak { get; set; }
    public int TotalCompletedDays { get; set; }
    public int TotalDaysSinceStart { get; set; }
    public double CompletionRate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime LastCompletedDate { get; set; }
    
    public string CompletionRateText => $"{CompletionRate:P1}";
    public string StreakText => CurrentStreak == 1 ? "1 dag" : $"{CurrentStreak} dage";
    public string LongestStreakText => LongestStreak == 1 ? "1 dag" : $"{LongestStreak} dage";
} 