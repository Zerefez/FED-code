using JanuarMAUI.ViewModels;

namespace JanuarMAUI.Views;

public partial class SettingsPage : ContentPage
{
    public SettingsPage(SettingsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        
        if (BindingContext is SettingsViewModel viewModel)
        {
            await viewModel.InitializeAsync();
        }
    }
} 