using _2025JuneMAUI.Models;

namespace _2025JuneMAUI.Services
{
    public interface IStudentService
    {
        Task<List<Student>> GetStudentsForExamAsync(int examId);
        Task<Student> CreateStudentAsync(int examId, string studentNo, string firstName, string lastName, int order);
        Task<Student> UpdateStudentAsync(int id, string studentNo, string firstName, string lastName, int order);
        Task<bool> DeleteStudentAsync(int studentId);
        Task SwapStudentOrdersAsync(int studentId1, int studentId2);
        Task<bool> ValidateStudentDataAsync(int examId, string studentNo, string firstName, string lastName);
        Task<int> GetNextOrderAsync(int examId);
        Task<string> GetExamStatsAsync(int examId);
        string CalculateAverageGrade(List<Student> students);
        Dictionary<string, int> GetGradeDistribution(List<Student> students);
    }
} 