using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Dialog service implementation providing cross-platform user interaction capabilities
    // Abstracts platform-specific dialog implementations behind a common interface
    // Enables consistent user communication patterns and testability through interface
    public class DialogService : IDialogService
    {
        // Display an informational alert dialog to the user
        // Async method ensures UI thread is not blocked during dialog display
        // Uses MAUI Shell's DisplayAlert for cross-platform dialog rendering
        public async Task ShowAlertAsync(string title, string message) => 
            // Shell.Current provides access to the current Shell instance for navigation and dialogs
            // DisplayAlert creates a platform-appropriate alert dialog (UIAlertController on iOS, AlertDialog on Android, etc.)
            // "OK" button provides single-action dismissal consistent across platforms
            await Shell.Current.DisplayAlert(title, message, "OK");

        // Display a confirmation dialog with Yes/No options
        // Returns boolean indicating user's choice for conditional logic execution
        // Async method ensures non-blocking operation for responsive UI
        public async Task<bool> ShowConfirmAsync(string title, string message) => 
            // Shell.Current.DisplayAlert with two buttons creates a confirmation dialog
            // "Ja" (Yes) and "Nej" (No) provide Danish language confirmation options
            // Returns true if user selects "Ja", false if user selects "Nej"
            // Platform-specific rendering ensures native look and feel on each target platform
            await Shell.Current.DisplayAlert(title, message, "Ja", "Nej");
    }
} 