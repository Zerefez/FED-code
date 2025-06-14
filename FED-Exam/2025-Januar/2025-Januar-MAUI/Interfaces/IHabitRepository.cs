using JanuarMAUI.Models;

namespace JanuarMAUI.Interfaces;

public interface IHabitRepository
{
    Task<List<Habit>> GetAllAsync();
    Task<Habit?> GetByIdAsync(long id);
    Task<long> CreateAsync(Habit habit);
    Task<bool> UpdateAsync(Habit habit);
    Task<bool> DeleteAsync(long id);
    Task<List<Habit>> SearchAsync(string searchTerm);
} 