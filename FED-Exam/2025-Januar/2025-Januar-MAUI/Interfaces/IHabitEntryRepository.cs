using JanuarMAUI.Models;

namespace JanuarMAUI.Interfaces;

public interface IHabitEntryRepository
{
    Task<List<HabitEntry>> GetAllAsync();
    Task<List<HabitEntry>> GetByHabitIdAsync(long habitId);
    Task<HabitEntry?> GetByHabitIdAndDateAsync(long habitId, DateTime date);
    Task<long> CreateAsync(HabitEntry habitEntry);
    Task<bool> UpdateAsync(HabitEntry habitEntry);
    Task<bool> DeleteAsync(long id);
    Task<List<HabitEntry>> GetByDateRangeAsync(long habitId, DateTime startDate, DateTime endDate);
} 