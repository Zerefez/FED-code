namespace _2025JuneMAUI.Services
{
    public interface IDialogService
    {
        Task ShowAlertAsync(string title, string message);
        Task<bool> ShowConfirmAsync(string title, string message);
    }
} 