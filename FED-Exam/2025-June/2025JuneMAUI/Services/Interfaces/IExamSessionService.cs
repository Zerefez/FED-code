using _2025JuneMAUI.Models;

namespace _2025JuneMAUI.Services
{
    public interface IExamSessionService
    {
        Task<List<Student>> GetStudentsForExamAsync(int examId);
        Task<Student?> GetCurrentStudentAsync(int examId, int currentIndex);
        Task<Student?> FindFirstUncompletedStudentAsync(int examId);
        int DrawRandomQuestion(int maxQuestions);
        string[] GetAvailableGrades();
        string FormatTime(int totalSeconds);
        string GetTimerColor(int remainingSeconds, int totalDurationSeconds);
        Task SaveStudentExamDataAsync(Student student, int questionNumber, int actualTimeMinutes, string notes, string grade);
        Task<(int Total, int Completed, string Stats)> GetExamProgressAsync(int examId);
        bool IsStudentCompleted(Student student);
        Task<string> GetStudentSummaryAsync(Student student);
        Task<bool> HasUncompletedStudentsAsync(int examId);
        Task<string> GetExamCompletionSummaryAsync(int examId);
    }
} 