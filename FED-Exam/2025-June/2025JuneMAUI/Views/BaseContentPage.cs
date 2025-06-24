using CommunityToolkit.Mvvm.Input;
using _2025JuneMAUI.ViewModels;

namespace _2025JuneMAUI.Views
{
    // Abstract base page class providing common functionality for all content pages
    // Generic class with ViewModel constraint ensures type-safe ViewModel access
    // Abstract prevents direct instantiation while enabling inheritance for derived pages
    public abstract class BaseContentPage<TViewModel> : ContentPage where TViewModel : BaseViewModel
    {
        // Protected readonly field providing access to strongly-typed ViewModel
        // Protected visibility allows derived classes to access ViewModel
        // Readonly ensures ViewModel reference cannot be changed after construction
        protected readonly TViewModel ViewModel;

        // Constructor accepting ViewModel through dependency injection
        // Generic constraint ensures only compatible ViewModels can be injected
        // Sets up data binding context for XAML data binding
        protected BaseContentPage(TViewModel viewModel)
        {
            // Assign injected ViewModel to protected field for derived class access
            ViewModel = viewModel;
            
            // Set ViewModel as data binding context for XAML binding resolution
            // Enables XAML elements to bind to ViewModel properties and commands
            BindingContext = viewModel;
        }

        // Override OnAppearing to provide custom page lifecycle handling
        // Called when page becomes visible to user for initialization tasks
        // Async override enables asynchronous operations during page appearance
        protected override async void OnAppearing()
        {
            // Call base implementation to ensure proper MAUI lifecycle handling
            // Base.OnAppearing handles framework-level appearance logic
            base.OnAppearing();
            
            // Execute custom page-specific appearance logic
            // Virtual method allows derived classes to customize appearance behavior
            await OnPageAppearing();
        }

        // Virtual method for page-specific appearance initialization
        // Async method supports database loading, service calls, or other async operations
        // Virtual allows derived classes to override with specific initialization logic
        protected virtual async Task OnPageAppearing()
        {
            // Default implementation completes immediately with no operation
            // Task.CompletedTask provides efficient completed task for base implementation
            // Derived classes can override to add specific appearance behavior
            await Task.CompletedTask;
        }

        // Protected utility method for executing refresh commands with error handling
        // Provides consistent pattern for executing async commands from page lifecycle events
        // Null-conditional operator handles cases where command might not be available
        protected async Task ExecuteRefreshCommand(IAsyncRelayCommand? command)
        {
            // Check if command exists and can execute before attempting execution
            // CanExecute check prevents execution when command is disabled or unavailable
            if (command?.CanExecute(null) == true)
            {
                // Execute the async command and await completion
                // Async execution ensures UI remains responsive during command execution
                await command.ExecuteAsync(null);
            }
        }
    }
} 