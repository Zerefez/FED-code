namespace _2025JuneMAUI;

// Main page class serving as the application's landing page and navigation hub
// Inherits from ContentPage to provide standard page layout and lifecycle management
// Partial class enables XAML code-behind integration for UI event handling
public partial class MainPage : ContentPage
{
	// Constructor for main page initialization
	// Called when page is created and added to navigation stack
	public MainPage()
	{
		// Initialize XAML components defined in MainPage.xaml
		// Loads UI elements, layout structure, and data binding configurations
		InitializeComponent();
	}

	// Event handler for exam management navigation button
	// Async method enables non-blocking navigation to prevent UI freezing
	// object? sender parameter represents the button that triggered the event
	private async void OnExamPageClicked(object? sender, EventArgs e)
	{
		// Navigate to ExamPage using Shell navigation with absolute route
		// "//" prefix indicates absolute navigation to specific tab/route
		// Async navigation prevents UI blocking during page transitions
		await Shell.Current.GoToAsync("//ExamPage");
	}

	// Event handler for student management navigation button
	// Provides navigation to student administration functionality
	private async void OnStudentPageClicked(object? sender, EventArgs e)
	{
		// Navigate to StudentPage using Shell's absolute routing system
		// Absolute route ensures navigation to correct tab regardless of current location
		await Shell.Current.GoToAsync("//StudentPage");
	}

	// Event handler for examination session navigation button
	// Enables navigation to active examination interface
	private async void OnStartExamPageClicked(object? sender, EventArgs e)
	{
		// Navigate to ExamSessionPage for conducting examinations
		// Absolute routing provides consistent navigation behavior
		await Shell.Current.GoToAsync("//ExamSessionPage");
	}

	// Event handler for examination history navigation button
	// Provides access to completed examination records and statistics
	private async void OnHistoryPageClicked(object? sender, EventArgs e)
	{
		// Navigate to HistoryPage for viewing examination results and reports
		// Shell navigation maintains consistent navigation patterns
		await Shell.Current.GoToAsync("//HistoryPage");
	}
}
