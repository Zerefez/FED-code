using _2025JuneMAUI.ViewModels;

namespace _2025JuneMAUI.Views;

// Examination session page class for conducting active examinations and managing student workflow
// Inherits from BaseContentPage to leverage common page functionality and ViewModel integration  
// Partial class enables XAML code-behind integration for examination session management UI
public partial class ExamSessionPage : BaseContentPage<ExamSessionViewModel>
{
    // Constructor accepting ExamSessionViewModel through dependency injection
    // Base constructor call establishes ViewModel binding and common page infrastructure
    public ExamSessionPage(ExamSessionViewModel viewModel) : base(viewModel)
    {
        // Initialize XAML components defined in ExamSessionPage.xaml
        // Loads examination interface elements, timer display, and workflow controls
        InitializeComponent();
    }

    // Override OnPageAppearing to provide examination session initialization when page becomes visible
    // Async method enables loading exam data and session setup without blocking UI thread
    // Called automatically by base class during page appearance lifecycle
    protected override async Task OnPageAppearing()
    {
        // Execute the LoadExams command to refresh available examination options when page appears
        // Ensures exam selection dropdown has current data for session initiation
        // ExecuteRefreshCommand provides safe command execution with proper error handling
        await ExecuteRefreshCommand(ViewModel.LoadExamsCommand);
    }
} 