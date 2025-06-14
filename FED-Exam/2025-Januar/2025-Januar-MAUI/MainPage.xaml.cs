
using JanuarMAUI.ViewModels;
using JanuarMAUI.Models;

namespace JanuarMAUI;

public partial class MainPage : ContentPage
{
    public MainPage(MainViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        
        try
        {
            System.Diagnostics.Debug.WriteLine("MainPage OnAppearing started");
            
            // Set today's date in the header
            TodayLabel.Text = $"I dag - {DateTime.Today:dd/MM/yyyy}";
            
            if (BindingContext is MainViewModel viewModel)
            {
                System.Diagnostics.Debug.WriteLine("MainViewModel found, loading habits...");
                // Always refresh the habits when returning to the page
                await viewModel.LoadHabitsAsync();
                System.Diagnostics.Debug.WriteLine("Habits loaded successfully");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("MainViewModel NOT found in BindingContext");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"MainPage OnAppearing error: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            await DisplayAlert("Error", $"An error occurred: {ex.Message}", "OK");
        }
    }

    private async void OnEditHabitClicked(object sender, EventArgs e)
    {
        if (sender is Button button && button.CommandParameter is Habit habit && BindingContext is MainViewModel viewModel)
        {
            await viewModel.EditHabitCommand.ExecuteAsync(habit);
        }
    }

    private async void OnToggleHabitClicked(object sender, EventArgs e)
    {
        if (sender is Button button && button.CommandParameter is Habit habit && BindingContext is MainViewModel viewModel)
        {
            await viewModel.ToggleHabitCompletionCommand.ExecuteAsync(habit);
        }
    }

    private async void OnDeleteHabitClicked(object sender, EventArgs e)
    {
        if (sender is Button button && button.CommandParameter is Habit habit && BindingContext is MainViewModel viewModel)
        {
            await viewModel.DeleteHabitCommand.ExecuteAsync(habit);
        }
    }
}
