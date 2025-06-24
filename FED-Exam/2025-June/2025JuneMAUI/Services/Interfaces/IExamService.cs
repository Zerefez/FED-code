using _2025JuneMAUI.Models;

namespace _2025JuneMAUI.Services
{
    public interface IExamService
    {
        Task<List<Exam>> GetAllExamsAsync();
        Task<Exam> CreateExamAsync(string termim, string courseName, string date, int questions, int duration, string startTime);
        Task<Exam> UpdateExamAsync(int id, string termim, string courseName, string date, int questions, int duration, string startTime);
        Task<bool> DeleteExamAsync(int examId);
        Task<bool> ValidateExamDataAsync(string termim, string courseName, int questions, int duration);
    }
} 