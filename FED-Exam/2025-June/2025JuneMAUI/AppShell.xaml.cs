namespace _2025JuneMAUI;

// Application Shell class providing navigation infrastructure and app-wide UI structure
// Inherits from Shell to leverage MAUI's unified navigation and flyout system
// Partial class enables XAML code-behind integration for navigation definition
public partial class AppShell : Shell
{
	// Constructor for Shell initialization and navigation configuration
	// Called when Shell is created to provide the main navigation container
	public AppShell()
	{
		// Initialize XAML components defined in AppShell.xaml
		// Loads navigation structure including TabBar, ShellContent items, and styling
		// Sets up the complete navigation hierarchy for the application
		InitializeComponent();
	}
}
