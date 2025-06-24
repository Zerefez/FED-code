using _2025JuneMAUI.Models;

namespace _2025JuneMAUI.Services
{
    public interface IDataService
    {
        // Exam operations
        Task<List<Exam>> GetExamsAsync();
        Task<Exam?> GetExamAsync(int id);
        Task<int> AddExamAsync(Exam exam);
        Task<int> UpdateExamAsync(Exam exam);
        Task<int> DeleteExamAsync(Exam exam);

        // Student operations
        Task<List<Student>> GetStudentsByExamIdAsync(int examId);
        Task<Student?> GetStudentAsync(int id);
        Task<int> AddStudentAsync(Student student);
        Task<int> UpdateStudentAsync(Student student);
        Task<int> DeleteStudentAsync(Student student);

        // Utility operations
        Task<int> GetNextExaminationOrderAsync(int examId);
        Task<double> GetExamAverageGradeAsync(int examId);
        Task<int> GetTotalStudentsForExamAsync(int examId);
        Task<int> GetCompletedStudentsForExamAsync(int examId);
    }
} 