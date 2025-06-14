using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;

namespace JanuarMAUI.ViewModels;

[QueryProperty(nameof(HabitToEdit), "HabitToEdit")]
public partial class AddHabitViewModel : BaseViewModel
{
    private readonly IHabitService _habitService;
    private readonly IDatabaseService _databaseService;

    [ObservableProperty]
    private string _name = string.Empty;

    [ObservableProperty]
    private string _description = string.Empty;

    [ObservableProperty]
    private DateTime _startDate = DateTime.Today;

    [ObservableProperty]
    private bool _isEditing;

    [ObservableProperty]
    private Habit? _habitToEdit;

    [ObservableProperty]
    private string _saveButtonText = "Gem Vane";

    public AddHabitViewModel(IHabitService habitService, IDatabaseService databaseService)
    {
        _habitService = habitService;
        _databaseService = databaseService;
        Title = "Tilføj Vane";
    }

    partial void OnHabitToEditChanged(Habit? value)
    {
        if (value != null)
        {
            IsEditing = true;
            Title = "Rediger Vane";
            SaveButtonText = "Opdater Vane";
            Name = value.Name ?? string.Empty;
            Description = value.Description ?? string.Empty;
            StartDate = value.StartDate;
        }
        else
        {
            IsEditing = false;
            Title = "Tilføj Vane";
            SaveButtonText = "Gem Vane";
            ResetForm();
        }
    }

    [RelayCommand]
    public async Task SaveHabitAsync()
    {
        if (IsBusy) return;

        // Trim input values
        var trimmedName = Name?.Trim() ?? string.Empty;
        var trimmedDescription = Description?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            await Shell.Current.DisplayAlert("Fejl", "Indtast et navn for vanen", "OK");
            return;
        }

        if (string.IsNullOrWhiteSpace(trimmedDescription))
        {
            await Shell.Current.DisplayAlert("Fejl", "Indtast en beskrivelse for vanen", "OK");
            return;
        }

        try
        {
            IsBusy = true;
            
            // Ensure database is initialized
            await _databaseService.InitializeDatabaseAsync();
            
            bool success;

            if (IsEditing && HabitToEdit != null)
            {
                HabitToEdit.Name = trimmedName;
                HabitToEdit.Description = trimmedDescription;
                HabitToEdit.StartDate = StartDate.Date;
                success = await _habitService.UpdateHabitAsync(HabitToEdit);
                
                if (success)
                {
                    await Shell.Current.DisplayAlert("Succes", "Vanen blev opdateret!", "OK");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"AddHabitViewModel: Creating new habit '{trimmedName}'");
                success = await _habitService.CreateHabitAsync(trimmedName, trimmedDescription, StartDate.Date);
                System.Diagnostics.Debug.WriteLine($"AddHabitViewModel: Create result: {success}");
                
                if (success)
                {
                    await Shell.Current.DisplayAlert("Succes", "Vanen blev oprettet!", "OK");
                }
            }

            if (success)
            {
                // Clear the form before navigating back
                ResetForm();
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                await Shell.Current.DisplayAlert("Fejl", "Kunne ikke gemme vanen. Prøv igen.", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Fejl", $"Kunne ikke gemme vanen: {ex.Message}\n\nStack trace: {ex.StackTrace}", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public async Task CancelAsync()
    {
        await Shell.Current.GoToAsync("..");
    }

    public override Task InitializeAsync()
    {
        if (!IsEditing)
        {
            ResetForm();
        }
        return Task.CompletedTask;
    }

    private void ResetForm()
    {
        Name = string.Empty;
        Description = string.Empty;
        StartDate = DateTime.Today;
    }
} 