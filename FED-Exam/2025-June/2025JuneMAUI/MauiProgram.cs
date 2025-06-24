using Microsoft.Extensions.Logging;
using _2025JuneMAUI.Data;
using _2025JuneMAUI.ViewModels;
using _2025JuneMAUI.Views;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI;

// Static class defining the MAUI application bootstrap and dependency injection configuration
// Contains the main entry point for configuring services, pages, and application settings
// Static class pattern ensures single configuration point and prevents instantiation
public static class MauiProgram
{
	// Main application configuration method creating and configuring the MAUI application
	// Returns configured MauiApp instance ready for platform-specific execution
	// Static method enables call without class instantiation during application startup
	public static MauiApp CreateMauiApp()
	{
		// Create the MAUI application builder for configuration
		// Builder pattern allows fluent configuration of application services and settings
		var builder = MauiApp.CreateBuilder();
		
		// Configure the main application class and font resources
		// UseMauiApp<App> registers the App class as the main application entry point
		builder
			.UseMauiApp<App>()
			.ConfigureFonts(fonts =>
			{
				// Register OpenSans Regular font with logical name for use throughout app
				// Custom fonts provide consistent typography across platforms
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				
				// Register OpenSans Semibold font for headings and emphasis
				// Semibold weight provides visual hierarchy in user interface
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
			});

		// Register Database as singleton service for application lifetime
		// Singleton ensures single database connection and instance sharing across app
		// Database class manages SQLite connection and data access operations
		builder.Services.AddSingleton<Database>();
		
		// Register Core Services section
		// Core services provide fundamental functionality needed throughout application
		
		// DialogService as singleton for consistent user interaction handling
		// Singleton ensures same dialog service instance used across all ViewModels
		builder.Services.AddSingleton<IDialogService, DialogService>();
		
		// DataService as singleton for centralized data access abstraction
		// Singleton provides consistent data access layer above database operations
		builder.Services.AddSingleton<IDataService, DataService>();
		
		// TimerService as transient for independent timer instances per usage
		// Transient ensures each exam session gets its own timer instance
		builder.Services.AddTransient<ITimerService, TimerService>();
		
		// Register Business Services section
		// Business services encapsulate domain-specific logic and validation
		
		// ExamService as transient for stateless exam management operations
		// Transient registration prevents state accumulation between operations
		builder.Services.AddTransient<IExamService, ExamService>();
		
		// StudentService as transient for independent student management per usage
		// Transient ensures clean state for each student management session
		builder.Services.AddTransient<IStudentService, StudentService>();
		
		// ExamSessionService as transient for independent examination session handling
		// Transient allows multiple concurrent examination sessions if needed
		builder.Services.AddTransient<IExamSessionService, ExamSessionService>();
		
		// Note: ValidationService and GradeCalculationService are static utility classes
		// Static classes don't require DI registration and provide pure function behavior
		
		// Register ViewModels section
		// ViewModels coordinate between UI and business services using MVVM pattern
		
		// ExamViewModel as transient for fresh state on each exam management session
		// Transient prevents data contamination between different exam operations
		builder.Services.AddTransient<ExamViewModel>();
		
		// StudentViewModel as transient for independent student management instances
		// Transient ensures clean form state for each student management session
		builder.Services.AddTransient<StudentViewModel>();
		
		// ExamSessionViewModel as transient for fresh examination session state
		// Transient prevents timer and session state conflicts between examinations
		builder.Services.AddTransient<ExamSessionViewModel>();
		
		// HistoryViewModel as transient for independent history viewing sessions
		// Transient allows multiple history views without state interference
		builder.Services.AddTransient<HistoryViewModel>();
		
		// Register Pages section
		// Pages represent the UI components that host ViewModels and handle user interaction
		
		// ExamPage as transient for fresh page instance on each navigation
		// Transient ensures clean UI state and proper ViewModel injection
		builder.Services.AddTransient<ExamPage>();
		
		// StudentPage as transient for independent page instances per navigation
		// Transient prevents UI state carryover between different page visits
		builder.Services.AddTransient<StudentPage>();
		
		// ExamSessionPage as transient for fresh examination interface per session
		// Transient ensures clean examination UI state for each exam session
		builder.Services.AddTransient<ExamSessionPage>();
		
		// HistoryPage as transient for independent history viewing instances
		// Transient allows multiple history page instances without conflicts
		builder.Services.AddTransient<HistoryPage>();

#if DEBUG
		// Add debug logging only in debug builds for development troubleshooting
		// Conditional compilation prevents logging overhead in release builds
		// Debug logger outputs to development console for real-time monitoring
		builder.Logging.AddDebug();
#endif

		// Build and return the configured MAUI application instance
		// Build() finalizes configuration and creates executable application
		return builder.Build();
	}
}
