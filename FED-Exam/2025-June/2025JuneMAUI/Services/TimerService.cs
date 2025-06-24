using System.Timers;
using _2025JuneMAUI.Services;

namespace _2025JuneMAUI.Services
{
    // Timer service implementation providing countdown and elapsed time functionality
    // Implements IDisposable for proper resource cleanup of timer resources
    // Supports both countdown mode and elapsed time tracking for examination purposes
    public class TimerService : ITimerService, IDisposable
    {
        // System.Timers.Timer instance for high-precision timing operations
        // Nullable to handle initialization and disposal states gracefully
        private System.Timers.Timer? _timer;
        
        // Current elapsed time in seconds since timer start
        // Used for both elapsed time display and countdown calculations
        private int _elapsedSeconds;
        
        // Total duration in seconds for countdown mode
        // Set when timer is configured for examination duration tracking
        private int _totalDurationSeconds;
        
        // Boolean flag indicating whether timer is currently active
        // Prevents multiple start operations and provides state information
        private bool _isRunning;
        
        // Boolean flag indicating countdown mode vs. elapsed time mode
        // Determines whether timer counts up (elapsed) or down (countdown)
        private bool _isCountdownMode;

        // Event fired every second when timer is running
        // Provides remaining seconds in countdown mode for UI updates
        public event EventHandler<int>? TimerTick;
        
        // Public property exposing timer running state
        // Enables UI elements to bind to timer state for conditional display
        public bool IsRunning => _isRunning;
        
        // Public property exposing current elapsed seconds
        // Used for time tracking and display formatting
        public int ElapsedSeconds => _elapsedSeconds;
        
        // Public property calculating remaining seconds in countdown mode
        // Math.Max ensures non-negative values when time expires
        public int RemainingSeconds => Math.Max(0, _totalDurationSeconds - _elapsedSeconds);
        
        // Public property exposing countdown mode state
        // Enables UI to adapt display based on timer mode
        public bool IsCountdownMode => _isCountdownMode;

        // Configure timer for countdown mode with specified duration
        // Sets total duration and enables countdown behavior
        public void SetCountdownDuration(int totalMinutes)
        {
            // Convert minutes to seconds for internal calculations
            // Seconds provide finer granularity for timer operations
            _totalDurationSeconds = totalMinutes * 60;
            
            // Enable countdown mode for timer behavior
            // Affects how timer events are fired and values calculated
            _isCountdownMode = true;
        }

        // Start or resume timer operation
        // Creates new timer instance if none exists or resumes existing timer
        public void Start()
        {
            // Prevent multiple timer instances by checking running state
            if (_isRunning) return;

            // Create new timer instance with 1-second interval
            // 1000ms interval provides second-by-second precision for time tracking
            _timer = new System.Timers.Timer(1000);
            
            // Subscribe to timer elapsed event for time tracking
            // Event handler updates elapsed time and fires tick events
            _timer.Elapsed += OnTimerElapsed;
            
            // Start timer operation and update running state
            _timer.Start();
            _isRunning = true;
        }

        // Stop timer operation but preserve elapsed time
        // Allows for pause/resume functionality in examination workflow
        public void Stop()
        {
            // Update running state first to prevent race conditions
            _isRunning = false;
            
            // Stop and dispose timer instance if it exists
            if (_timer != null)
            {
                _timer.Stop();      // Stop timer ticking
                _timer.Dispose();   // Release timer resources
                _timer = null;      // Clear reference for garbage collection
            }
        }

        // Reset timer to initial state
        // Clears elapsed time and stops timer operation
        public void Reset()
        {
            // Stop timer operation first
            Stop();
            
            // Reset elapsed time counter to zero
            // Prepares timer for fresh start
            _elapsedSeconds = 0;
        }

        // Format elapsed time as MM:SS string
        // Provides consistent time display format throughout application
        public string GetFormattedTime() => TimeSpan.FromSeconds(_elapsedSeconds).ToString(@"mm\:ss");
        
        // Format remaining time as MM:SS string for countdown display
        // Uses RemainingSeconds property for consistent countdown behavior
        public string GetFormattedRemainingTime() => TimeSpan.FromSeconds(RemainingSeconds).ToString(@"mm\:ss");
        
        // Get elapsed time in minutes for data storage
        // Integer division truncates seconds for minute-based recording
        public int GetElapsedMinutes() => _elapsedSeconds / 60;

        // Private event handler for timer elapsed events
        // Called every second when timer is running to update time tracking
        private void OnTimerElapsed(object? sender, ElapsedEventArgs e)
        {
            // Increment elapsed time counter
            _elapsedSeconds++;
            
            // Calculate appropriate value to emit based on timer mode
            // Countdown mode emits remaining seconds, elapsed mode emits elapsed seconds
            var valueToEmit = _isCountdownMode ? RemainingSeconds : _elapsedSeconds;
            
            // Fire timer tick event with calculated value
            // Subscribers can update UI or perform time-based logic
            TimerTick?.Invoke(this, valueToEmit);
        }

        // Dispose pattern implementation for proper resource cleanup
        // Ensures timer resources are released when service is disposed
        public void Dispose()
        {
            // Stop timer operation which also disposes timer instance
            // Handles all cleanup operations in single method call
            Stop();
        }
    }
} 