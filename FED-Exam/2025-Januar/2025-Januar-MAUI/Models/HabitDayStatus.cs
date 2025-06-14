namespace JanuarMAUI.Models;

public class HabitDayStatus
{
    public long HabitId { get; set; }
    public string HabitName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsMarked { get; set; }
    public string? Reason { get; set; }
    
    public string StatusIcon => IsCompleted ? "✅" : IsMarked ? "❌" : "⚪";
    public Color StatusColor => IsCompleted ? Colors.Green : IsMarked ? Colors.Red : Colors.Gray;
} 