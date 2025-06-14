using JanuarMAUI.ViewModels;

namespace JanuarMAUI.Views;

public partial class StatisticsPage : ContentPage
{
    public StatisticsPage(StatisticsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        
        if (BindingContext is StatisticsViewModel viewModel)
        {
            await viewModel.LoadStatisticsAsync();
        }
    }
} 