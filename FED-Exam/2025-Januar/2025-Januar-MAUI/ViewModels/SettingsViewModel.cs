using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JanuarMAUI.Interfaces;

namespace JanuarMAUI.ViewModels;

public partial class SettingsViewModel : BaseViewModel
{
    private readonly IHabitService _habitService;
    private readonly IDatabaseService _databaseService;

    public SettingsViewModel(IHabitService habitService, IDatabaseService databaseService)
    {
        _habitService = habitService;
        _databaseService = databaseService;
        Title = "Indstillinger";
    }

    [RelayCommand]
    public async Task ClearAllDataAsync()
    {
        bool confirm = await Shell.Current.DisplayAlert(
            "Bekræft sletning", 
            "Er du sikker på at du vil slette alle dine vaner og data? Denne handling kan ikke fortrydes.", 
            "Ja, slet alt", 
            "Annuller");

        if (!confirm) return;

        // Double confirmation for such a destructive action
        bool doubleConfirm = await Shell.Current.DisplayAlert(
            "Sidste bekræftelse", 
            "Dette vil PERMANENT slette alle dine data. Er du helt sikker?", 
            "Ja, jeg er sikker", 
            "Nej, stop");

        if (!doubleConfirm) return;

        try
        {
            IsBusy = true;
            
            // Get all habits and delete them (this should cascade to entries through the service)
            var habits = await _habitService.GetAllHabitsAsync();
            
            foreach (var habit in habits)
            {
                await _habitService.DeleteHabitAsync(habit.HabitId);
            }

            await Shell.Current.DisplayAlert("Færdig", "Alle data er blevet slettet.", "OK");
            
            // Navigate back to main page to refresh the empty state
            await Shell.Current.GoToAsync("//MainPage");
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke slette data: {ex.Message}", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    public override Task InitializeAsync()
    {
        return Task.CompletedTask;
    }
} 