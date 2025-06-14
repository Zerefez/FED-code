using CommunityToolkit.Mvvm.ComponentModel;

namespace JanuarMAUI.ViewModels;

public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private string _title = string.Empty;

    public virtual Task InitializeAsync()
    {
        return Task.CompletedTask;
    }
} 