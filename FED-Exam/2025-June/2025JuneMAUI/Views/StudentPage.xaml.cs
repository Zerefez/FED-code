using _2025JuneMAUI.ViewModels;

namespace _2025JuneMAUI.Views;

// Student management page class for administering student enrollment and examination ordering
// Inherits from BaseContentPage to leverage common page functionality and ViewModel integration
// Partial class enables XAML code-behind integration for student administration UI
public partial class StudentPage : BaseContentPage<StudentViewModel>
{
    // Constructor accepting StudentViewModel through dependency injection
    // Base constructor call establishes ViewModel binding and common page infrastructure
    public StudentPage(StudentViewModel viewModel) : base(viewModel)
    {
        // Initialize XAML components defined in StudentPage.xaml
        // Loads student form elements, lists, and data binding configurations for student management
        InitializeComponent();
    }

    // Override OnPageAppearing to provide student-specific initialization when page becomes visible
    // Async method enables loading student and exam data without blocking UI thread
    // Called automatically by base class during page appearance lifecycle
    protected override async Task OnPageAppearing()
    {
        // Execute the LoadExams command to refresh available exams when page appears
        // Ensures exam dropdown/picker has current data for student association
        // ExecuteRefreshCommand provides safe command execution with error handling
        await ExecuteRefreshCommand(ViewModel.LoadExamsCommand);
    }
} 