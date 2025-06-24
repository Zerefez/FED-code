using CommunityToolkit.Mvvm.ComponentModel;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.ViewModels
{
    // Base view model class providing common functionality for all ViewModels
    // Inherits from ObservableObject to provide INotifyPropertyChanged implementation
    // Uses partial class to enable source generators from CommunityToolkit.Mvvm
    public partial class BaseViewModel : ObservableObject
    {
        // Property indicating whether ViewModel is currently performing operations
        // ObservableProperty attribute generates INotifyPropertyChanged implementation
        // Used to control UI state during async operations (loading indicators, button states)
        [ObservableProperty]
        private bool isBusy;

        // Property for the title/heading of the current view/page
        // ObservableProperty enables automatic UI updates when title changes
        // Provides consistent title management across all ViewModels
        [ObservableProperty]
        private string title = string.Empty;

        // Protected method for executing async operations with consistent error handling
        // Virtual allows derived classes to override behavior while maintaining base functionality
        // Provides standardized pattern for ViewModel operations with loading states and error handling
        protected virtual async Task ExecuteAsync(Func<Task> operation, IDialogService? dialogService = null, bool showErrors = true)
        {
            // Prevent concurrent operations by checking busy state
            // Early return avoids overlapping async operations that could cause race conditions
            if (IsBusy) return;
            
            // Set busy state to true to indicate operation in progress
            // Triggers UI updates to show loading indicators and disable controls
            IsBusy = true;
            
            try
            {
                // Execute the provided async operation
                // Delegate pattern allows callers to provide specific operation logic
                await operation();
            }
            catch (Exception ex) when (showErrors && dialogService != null)
            {
                // Handle exceptions only when error display is enabled and dialog service available
                // Conditional exception handling allows for silent operations when needed
                // Show user-friendly error message through dialog service abstraction
                await dialogService.ShowAlertAsync("Fejl", ex.Message);
            }
            finally
            {
                // Always reset busy state regardless of operation success/failure
                // Ensures UI returns to normal state even if operation throws unhandled exception
                IsBusy = false;
            }
        }

        // Protected static utility method for synchronizing ObservableCollection with new data
        // Generic method supports any collection type for maximum reusability
        // Provides efficient collection updates that minimize UI refresh operations
        protected static void UpdateCollectionFromList<T>(System.Collections.ObjectModel.ObservableCollection<T> collection, IEnumerable<T> items)
        {
            // Clear existing items first to remove outdated data
            // Complete replacement ensures collection reflects current data state
            collection.Clear();
            
            // Add each new item to the collection
            // Triggers individual CollectionChanged events for proper UI data binding updates
            foreach (var item in items)
            {
                collection.Add(item);
            }
        }
    }
} 