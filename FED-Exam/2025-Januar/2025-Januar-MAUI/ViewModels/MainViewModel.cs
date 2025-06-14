using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;
using System.Collections.ObjectModel;

namespace JanuarMAUI.ViewModels;

public partial class MainViewModel : BaseViewModel
{
    private readonly IHabitService _habitService;
    private readonly IDatabaseService _databaseService;

    [ObservableProperty]
    private ObservableCollection<Habit> _habits = new();

    [ObservableProperty]
    private bool _hasHabits;

    public MainViewModel(IHabitService habitService, IDatabaseService databaseService)
    {
        _habitService = habitService;
        _databaseService = databaseService;
        Title = "Mine Vaner";
    }

    [RelayCommand]
    public async Task LoadHabitsAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            System.Diagnostics.Debug.WriteLine("MainViewModel: Starting LoadHabitsAsync...");
            
            // Ensure database is initialized first
            await _databaseService.InitializeDatabaseAsync();
            System.Diagnostics.Debug.WriteLine("MainViewModel: Database initialization complete");
            
            var habits = await _habitService.GetAllHabitsAsync();
            System.Diagnostics.Debug.WriteLine($"MainViewModel: Loaded {habits.Count} habits from service");
            
            // Use Dispatcher to ensure UI updates happen on the main thread
            await MainThread.InvokeOnMainThreadAsync(() =>
            {
                Habits.Clear();
                System.Diagnostics.Debug.WriteLine($"MainViewModel: Cleared habits collection");
                
                foreach (var habit in habits)
                {
                    System.Diagnostics.Debug.WriteLine($"MainViewModel: Adding habit: {habit.Name} (ID: {habit.HabitId})");
                    Habits.Add(habit);
                }

                HasHabits = Habits.Count > 0;
                System.Diagnostics.Debug.WriteLine($"MainViewModel: Final collection count: {Habits.Count}");
                System.Diagnostics.Debug.WriteLine($"MainViewModel: HasHabits set to: {HasHabits}");
            });
            
            // Update completion status and streaks for each habit
            var today = DateTime.Today;
            for (int i = 0; i < Habits.Count; i++)
            {
                var habit = Habits[i];
                try
                {
                    habit.IsCompletedToday = await _habitService.IsHabitCompletedOnDateAsync(habit.HabitId, today);
                    habit.CurrentStreak = await _habitService.GetCurrentStreakAsync(habit.HabitId);
                    habit.LongestStreak = await _habitService.GetLongestStreakAsync(habit.HabitId);
                    System.Diagnostics.Debug.WriteLine($"MainViewModel: Updated stats for habit: {habit.Name}");
                }
                catch (Exception habitEx)
                {
                    System.Diagnostics.Debug.WriteLine($"MainViewModel: Error updating habit {habit.Name}: {habitEx.Message}");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"MainViewModel: Error loading habits: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"MainViewModel: Stack trace: {ex.StackTrace}");
            
            await MainThread.InvokeOnMainThreadAsync(async () =>
            {
                await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke indlæse vaner: {ex.Message}", "OK");
            });
        }
        finally
        {
            IsBusy = false;
            System.Diagnostics.Debug.WriteLine("MainViewModel: LoadHabitsAsync completed");
        }
    }

    [RelayCommand]
    public async Task AddHabitAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("Navigating to AddHabitPage...");
            await Shell.Current.GoToAsync("AddHabitPage");
            System.Diagnostics.Debug.WriteLine("Navigation to AddHabitPage completed");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error navigating to AddHabitPage: {ex.Message}");
            await Shell.Current.DisplayAlert("Navigation Error", $"Could not navigate to add habit page: {ex.Message}", "OK");
        }
    }

    [RelayCommand]
    public async Task EditHabitAsync(Habit habit)
    {
        if (habit == null) return;
        
        var navigationParameter = new Dictionary<string, object>
        {
            ["HabitToEdit"] = habit
        };
        
        await Shell.Current.GoToAsync("AddHabitPage", navigationParameter);
    }

    [RelayCommand]
    public async Task DeleteHabitAsync(Habit habit)
    {
        if (habit == null) return;

        bool answer = await Shell.Current.DisplayAlert(
            "Slet Vane", 
            $"Er du sikker på at du vil slette '{habit.Name}'?", 
            "Ja", "Nej");

        if (answer)
        {
            var result = await _habitService.DeleteHabitAsync(habit.HabitId);
            if (result)
            {
                Habits.Remove(habit);
                HasHabits = Habits.Any();
            }
        }
    }

    [RelayCommand]
    public async Task ToggleHabitCompletionAsync(Habit habit)
    {
        if (habit == null) return;

        try
        {
            var today = DateTime.Today;
            var isCompleted = await _habitService.IsHabitCompletedOnDateAsync(habit.HabitId, today);

            if (isCompleted)
            {
                await _habitService.MarkHabitNotCompletedAsync(habit.HabitId, today);
                await Shell.Current.DisplayAlert("Vane opdateret", $"'{habit.Name}' er markeret som ikke udført i dag.", "OK");
            }
            else
            {
                await _habitService.MarkHabitCompletedAsync(habit.HabitId, today);
                await Shell.Current.DisplayAlert("Godt klaret!", $"'{habit.Name}' er markeret som udført i dag! 🎉", "OK");
            }

            // Refresh the habit to show updated streaks
            await LoadHabitsAsync();
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke opdatere vane: {ex.Message}", "OK");
        }
    }

    public override async Task InitializeAsync()
    {
        await LoadHabitsAsync();
    }
} 