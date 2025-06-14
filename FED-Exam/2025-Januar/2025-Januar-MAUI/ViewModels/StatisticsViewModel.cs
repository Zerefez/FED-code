using CommunityToolkit.Mvvm.ComponentModel;
using JanuarMAUI.Interfaces;

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

    public StatisticsViewModel(IHabitService habitService, IDatabaseService databaseService)
    {
        _habitService = habitService;
        _databaseService = databaseService;
        Title = "Statistik";
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

    public override async Task InitializeAsync()
    {
        await LoadStatisticsAsync();
    }
} 