using JanuarMAUI.ViewModels;

namespace JanuarMAUI.Views;

public partial class AddHabitPage : ContentPage
{
    public AddHabitPage(AddHabitViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        
        if (BindingContext is AddHabitViewModel viewModel)
        {
            await viewModel.InitializeAsync();
        }
    }
} 