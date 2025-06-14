using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;

namespace JanuarMAUI.Repositories;

public class HabitRepository : IHabitRepository
{
    private readonly IDatabaseService _databaseService;

    public HabitRepository(IDatabaseService databaseService)
    {
        _databaseService = databaseService;
    }

    public async Task<List<Habit>> GetAllAsync()
    {
        System.Diagnostics.Debug.WriteLine("HabitRepository: Getting all habits");
        var database = await _databaseService.GetConnectionAsync();
        var habits = await database.Table<Habit>().OrderByDescending(h => h.CreatedAt).ToListAsync();
        System.Diagnostics.Debug.WriteLine($"HabitRepository: Found {habits.Count} habits");
        return habits;
    }

    public async Task<Habit?> GetByIdAsync(long id)
    {
        var database = await _databaseService.GetConnectionAsync();
        return await database.Table<Habit>().Where(h => h.HabitId == id).FirstOrDefaultAsync();
    }

    public async Task<long> CreateAsync(Habit habit)
    {
        System.Diagnostics.Debug.WriteLine($"HabitRepository: Creating habit '{habit.Name}'");
        var database = await _databaseService.GetConnectionAsync();
        habit.CreatedAt = DateTime.Now;
        habit.UpdatedAt = DateTime.Now;
        await database.InsertAsync(habit);
        System.Diagnostics.Debug.WriteLine($"HabitRepository: Created habit with ID {habit.HabitId}");
        return habit.HabitId;
    }

    public async Task<bool> UpdateAsync(Habit habit)
    {
        var database = await _databaseService.GetConnectionAsync();
        habit.UpdatedAt = DateTime.Now;
        var result = await database.UpdateAsync(habit);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var database = await _databaseService.GetConnectionAsync();
        var result = await database.DeleteAsync<Habit>(id);
        return result > 0;
    }

    public async Task<List<Habit>> SearchAsync(string searchTerm)
    {
        var database = await _databaseService.GetConnectionAsync();
        return await database.Table<Habit>()
            .Where(h => h.Name!.Contains(searchTerm) || h.Description!.Contains(searchTerm))
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }
} 