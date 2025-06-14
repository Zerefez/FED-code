using CommunityToolkit.Mvvm.ComponentModel;

namespace JanuarMAUI.Models;

public partial class CalendarDay : ObservableObject
{
    [ObservableProperty]
    private DateTime _date;

    [ObservableProperty]
    private bool _isCurrentMonth;

    [ObservableProperty]
    private bool _isToday;

    [ObservableProperty]
    private List<HabitDayStatus> _habitStatuses = new();

    [ObservableProperty]
    private double _completionPercentage;

    [ObservableProperty]
    private string _displayText = string.Empty;

    [ObservableProperty]
    private Color _backgroundColor = Colors.Transparent;

    [ObservableProperty]
    private Color _textColor = Colors.Black;

    public CalendarDay(DateTime date, bool isCurrentMonth = true)
    {
        Date = date;
        IsCurrentMonth = isCurrentMonth;
        IsToday = date.Date == DateTime.Today;
        DisplayText = date.Day.ToString();
        UpdateColors();
    }

    public void UpdateCompletionStatus()
    {
        if (HabitStatuses.Count == 0)
        {
            CompletionPercentage = 0;
        }
        else
        {
            var completedCount = HabitStatuses.Count(h => h.IsCompleted);
            CompletionPercentage = (double)completedCount / HabitStatuses.Count;
        }
        
        UpdateColors();
    }

    private void UpdateColors()
    {
        if (!IsCurrentMonth)
        {
            BackgroundColor = Colors.Transparent;
            TextColor = Colors.Gray;
            return;
        }

        if (IsToday)
        {
            BackgroundColor = Color.FromArgb("#2196F3");
            TextColor = Colors.White;
            return;
        }

        // Color based on completion percentage
        if (CompletionPercentage >= 1.0)
        {
            BackgroundColor = Color.FromArgb("#4CAF50"); // Green for 100%
            TextColor = Colors.White;
        }
        else if (CompletionPercentage >= 0.8)
        {
            BackgroundColor = Color.FromArgb("#8BC34A"); // Light green for 80%+
            TextColor = Colors.White;
        }
        else if (CompletionPercentage >= 0.6)
        {
            BackgroundColor = Color.FromArgb("#FFC107"); // Yellow for 60%+
            TextColor = Colors.Black;
        }
        else if (CompletionPercentage >= 0.4)
        {
            BackgroundColor = Color.FromArgb("#FF9800"); // Orange for 40%+
            TextColor = Colors.White;
        }
        else if (CompletionPercentage > 0)
        {
            BackgroundColor = Color.FromArgb("#FF5722"); // Red-orange for some completion
            TextColor = Colors.White;
        }
        else if (HabitStatuses.Count > 0)
        {
            BackgroundColor = Color.FromArgb("#F44336"); // Red for 0% completion
            TextColor = Colors.White;
        }
        else
        {
            BackgroundColor = Colors.Transparent;
            TextColor = Colors.Black;
        }
    }
} 