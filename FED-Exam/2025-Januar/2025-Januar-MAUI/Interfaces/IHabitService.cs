using JanuarMAUI.Models;

namespace JanuarMAUI.Interfaces;

public interface IHabitService
{
    Task<List<Habit>> GetAllHabitsAsync();
    Task<Habit?> GetHabitByIdAsync(long id);
    Task<bool> CreateHabitAsync(string name, string description, DateTime startDate);
    Task<bool> UpdateHabitAsync(Habit habit);
    Task<bool> DeleteHabitAsync(long id);
    Task<bool> MarkHabitCompletedAsync(long habitId, DateTime date);
    Task<bool> MarkHabitNotCompletedAsync(long habitId, DateTime date, string? reason = null);
    Task<bool> UndoHabitMarkingAsync(long habitId, DateTime date);
    Task<long> GetCurrentStreakAsync(long habitId);
    Task<long> GetLongestStreakAsync(long habitId);
    Task<List<HabitEntry>> GetHabitEntriesAsync(long habitId, DateTime startDate, DateTime endDate);
    Task<bool> IsHabitCompletedOnDateAsync(long habitId, DateTime date);
} 