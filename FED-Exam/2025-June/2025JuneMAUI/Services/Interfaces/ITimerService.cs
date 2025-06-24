namespace _2025JuneMAUI.Services
{
    public interface ITimerService
    {
        event EventHandler<int>? TimerTick;
        
        void Start();
        void Stop();
        void Reset();
        void SetCountdownDuration(int totalMinutes);
        bool IsRunning { get; }
        int ElapsedSeconds { get; }
        int RemainingSeconds { get; }
        string GetFormattedTime();
        string GetFormattedRemainingTime();
        int GetElapsedMinutes();
        bool IsCountdownMode { get; }
    }
} 