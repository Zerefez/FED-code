using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;
using System.Collections.ObjectModel;

namespace JanuarMAUI.ViewModels;

public partial class StatisticsViewModel : BaseViewModel
{
    private readonly IHabitService _habitService;
    private readonly IDatabaseService _databaseService;

    [ObservableProperty]
    private int _totalHabits;

    [ObservableProperty]
    private int _completedToday;

    [ObservableProperty]
    private double _weeklyProgress;

    [ObservableProperty]
    private string _weeklyProgressText = string.Empty;

    [ObservableProperty]
    private ObservableCollection<CalendarDay> _calendarDays = new();

    [ObservableProperty]
    private ObservableCollection<HabitStatistics> _habitStatistics = new();

    [ObservableProperty]
    private DateTime _currentCalendarMonth = DateTime.Today;

    [ObservableProperty]
    private string _calendarMonthText = string.Empty;

    [ObservableProperty]
    private CalendarDay? _selectedDay;

    [ObservableProperty]
    private bool _hasSelectedDay;

    public StatisticsViewModel(IHabitService habitService, IDatabaseService databaseService)
    {
        _habitService = habitService;
        _databaseService = databaseService;
        Title = "Statistik";
        UpdateCalendarMonthText();
    }

    public async Task LoadStatisticsAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            
            // Ensure database is initialized
            await _databaseService.InitializeDatabaseAsync();
            
            var habits = await _habitService.GetAllHabitsAsync();
            TotalHabits = habits.Count;

            var today = DateTime.Today;
            var completedCount = 0;

            foreach (var habit in habits)
            {
                var isCompleted = await _habitService.IsHabitCompletedOnDateAsync(habit.HabitId, today);
                if (isCompleted)
                    completedCount++;
            }

            CompletedToday = completedCount;

            // Calculate weekly progress
            if (TotalHabits > 0)
            {
                var weekStart = today.AddDays(-(int)today.DayOfWeek);
                var totalPossible = TotalHabits * 7; // 7 days in week
                var totalCompleted = 0;

                for (int i = 0; i < 7; i++)
                {
                    var checkDate = weekStart.AddDays(i);
                    if (checkDate > today) break; // Don't count future days

                    foreach (var habit in habits)
                    {
                        var isCompleted = await _habitService.IsHabitCompletedOnDateAsync(habit.HabitId, checkDate);
                        if (isCompleted)
                            totalCompleted++;
                    }
                }

                var daysPassed = Math.Min((int)(today - weekStart).TotalDays + 1, 7);
                var possibleCompleted = TotalHabits * daysPassed;
                
                WeeklyProgress = possibleCompleted > 0 ? (double)totalCompleted / possibleCompleted : 0;
                WeeklyProgressText = $"{totalCompleted} ud af {possibleCompleted} mulige ({WeeklyProgress:P0})";
            }
            else
            {
                WeeklyProgress = 0;
                WeeklyProgressText = "Ingen vaner endnu";
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke indlæse statistik: {ex.Message}", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public async Task PreviousMonthAsync()
    {
        CurrentCalendarMonth = CurrentCalendarMonth.AddMonths(-1);
        UpdateCalendarMonthText();
        await LoadCalendarAsync();
    }

    [RelayCommand]
    public async Task NextMonthAsync()
    {
        CurrentCalendarMonth = CurrentCalendarMonth.AddMonths(1);
        UpdateCalendarMonthText();
        await LoadCalendarAsync();
    }

    [RelayCommand]
    public void SelectDay(CalendarDay day)
    {
        SelectedDay = day;
        HasSelectedDay = day != null;
    }

    private void UpdateCalendarMonthText()
    {
        CalendarMonthText = CurrentCalendarMonth.ToString("MMMM yyyy");
    }

    public async Task LoadCalendarAsync()
    {
        try
        {
            var habits = await _habitService.GetAllHabitsAsync();
            if (habits.Count == 0)
            {
                CalendarDays.Clear();
                return;
            }

            var calendarDays = new List<CalendarDay>();
            
            // Get first day of the month and calculate calendar start
            var firstDayOfMonth = new DateTime(CurrentCalendarMonth.Year, CurrentCalendarMonth.Month, 1);
            var startOfCalendar = firstDayOfMonth.AddDays(-(int)firstDayOfMonth.DayOfWeek);
            
            // Generate 42 days (6 weeks) for the calendar
            for (int i = 0; i < 42; i++)
            {
                var date = startOfCalendar.AddDays(i);
                var isCurrentMonth = date.Month == CurrentCalendarMonth.Month;
                var calendarDay = new CalendarDay(date, isCurrentMonth);
                
                if (isCurrentMonth)
                {
                    // Load habit statuses for this day
                    var habitStatuses = new List<HabitDayStatus>();
                    
                    foreach (var habit in habits)
                    {
                        var entry = await _habitService.GetHabitEntriesAsync(habit.HabitId, date, date);
                        var dayEntry = entry.FirstOrDefault();
                        
                        var status = new HabitDayStatus
                        {
                            HabitId = habit.HabitId,
                            HabitName = habit.Name ?? "",
                            Date = date,
                            IsCompleted = dayEntry?.Completed ?? false,
                            IsMarked = dayEntry != null,
                            Reason = dayEntry?.Reason
                        };
                        
                        habitStatuses.Add(status);
                    }
                    
                    calendarDay.HabitStatuses = habitStatuses;
                    calendarDay.UpdateCompletionStatus();
                }
                
                calendarDays.Add(calendarDay);
            }
            
            CalendarDays.Clear();
            foreach (var day in calendarDays)
            {
                CalendarDays.Add(day);
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke indlæse kalender: {ex.Message}", "OK");
        }
    }

    public async Task LoadHabitStatisticsAsync()
    {
        try
        {
            var habits = await _habitService.GetAllHabitsAsync();
            var statistics = new List<HabitStatistics>();
            
            foreach (var habit in habits)
            {
                var currentStreak = await _habitService.GetCurrentStreakAsync(habit.HabitId);
                var longestStreak = await _habitService.GetLongestStreakAsync(habit.HabitId);
                
                // Calculate total days since start
                var daysSinceStart = (int)(DateTime.Today - habit.StartDate).TotalDays + 1;
                
                // Get all entries for this habit
                var entries = await _habitService.GetHabitEntriesAsync(habit.HabitId, habit.StartDate, DateTime.Today);
                var completedDays = entries.Count(e => e.Completed);
                
                var completionRate = daysSinceStart > 0 ? (double)completedDays / daysSinceStart : 0;
                
                var lastCompletedEntry = entries.Where(e => e.Completed).OrderByDescending(e => e.Date).FirstOrDefault();
                
                var stats = new HabitStatistics
                {
                    HabitId = habit.HabitId,
                    HabitName = habit.Name ?? "",
                    CurrentStreak = currentStreak,
                    LongestStreak = longestStreak,
                    TotalCompletedDays = completedDays,
                    TotalDaysSinceStart = daysSinceStart,
                    CompletionRate = completionRate,
                    StartDate = habit.StartDate,
                    LastCompletedDate = lastCompletedEntry?.Date ?? DateTime.MinValue
                };
                
                statistics.Add(stats);
            }
            
            HabitStatistics.Clear();
            foreach (var stat in statistics.OrderByDescending(s => s.CompletionRate))
            {
                HabitStatistics.Add(stat);
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke indlæse vanestatistik: {ex.Message}", "OK");
        }
    }

    public override async Task InitializeAsync()
    {
        await LoadStatisticsAsync();
        await LoadCalendarAsync();
        await LoadHabitStatisticsAsync();
    }
} 