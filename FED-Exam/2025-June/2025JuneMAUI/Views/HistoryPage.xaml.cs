using _2025JuneMAUI.ViewModels;

namespace _2025JuneMAUI.Views;

// History page class for viewing completed examination records and statistical analysis
// Inherits from BaseContentPage to leverage common page functionality and ViewModel integration
// Partial class enables XAML code-behind integration for examination history and reporting UI
public partial class HistoryPage : BaseContentPage<HistoryViewModel>
{
    // Constructor accepting HistoryViewModel through dependency injection
    // Base constructor call establishes ViewModel binding and common page infrastructure
    public HistoryPage(HistoryViewModel viewModel) : base(viewModel)
    {
        // Initialize XAML components defined in HistoryPage.xaml
        // Loads history display elements, exam lists, and statistical reporting controls
        InitializeComponent();
    }

    // Override OnPageAppearing to provide history-specific initialization when page becomes visible
    // Async method enables loading historical exam data without blocking UI thread
    // Called automatically by base class during page appearance lifecycle
    protected override async Task OnPageAppearing()
    {
        // Execute the LoadExams command to refresh available examination history when page appears
        // Ensures exam selection has current data for historical analysis and reporting
        // ExecuteRefreshCommand provides safe command execution with comprehensive error handling
        await ExecuteRefreshCommand(ViewModel.LoadExamsCommand);
    }
} 