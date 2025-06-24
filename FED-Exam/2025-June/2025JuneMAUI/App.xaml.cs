namespace _2025JuneMAUI;

// Main application class defining global application behavior and lifecycle
// Inherits from Application to provide MAUI application framework integration
// Partial class enables XAML code-behind integration for resource definitions
public partial class App : Application
{
	// Constructor for application initialization and global configuration
	// Called once during application startup before any UI is created
	public App()
	{
		// Initialize XAML components defined in App.xaml
		// Loads global resources like styles, colors, and application-wide settings
		InitializeComponent();
		
		// Force application to use Light theme regardless of system preference
		// Current! assertion ensures Application.Current is not null during startup
		// Provides consistent UI appearance across all platforms and user settings
		Current!.UserAppTheme = AppTheme.Light;
	}

	// Override method for creating the main application window
	// Called by MAUI framework when application needs to display UI
	// IActivationState provides platform-specific activation context (can be null)
	protected override Window CreateWindow(IActivationState? activationState)
	{
		// Create and return new Window with AppShell as the main navigation container
		// AppShell provides the tabbed navigation structure for the entire application
		// Window wraps the Shell and provides platform-specific window management
		return new Window(new AppShell());
	}
}