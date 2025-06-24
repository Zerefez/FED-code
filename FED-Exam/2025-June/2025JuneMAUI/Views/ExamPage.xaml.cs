using _2025JuneMAUI.ViewModels;

namespace _2025JuneMAUI.Views;

// Exam management page class for creating, editing, and managing examination configurations
// Inherits from BaseContentPage to leverage common page functionality and ViewModel integration
// Partial class enables XAML code-behind integration for exam management UI
public partial class ExamPage : BaseContentPage<ExamViewModel>
{
    // Constructor accepting ExamViewModel through dependency injection
    // Base constructor call sets up ViewModel binding and common page infrastructure
    public ExamPage(ExamViewModel viewModel) : base(viewModel)
    {
        // Initialize XAML components defined in ExamPage.xaml
        // Loads form elements, buttons, and data binding configurations for exam management
        InitializeComponent();
    }

    // Override OnPageAppearing to provide exam-specific initialization when page becomes visible
    // Async method enables loading exam data without blocking UI thread
    // Called automatically by base class during page appearance lifecycle
    protected override async Task OnPageAppearing()
    {
        // Execute the LoadExams command to refresh exam list when page appears
        // Ensures exam data is current when user navigates to the page
        // ExecuteRefreshCommand provides safe command execution with null checking
        await ExecuteRefreshCommand(ViewModel.LoadExamsCommand);
    }
} 