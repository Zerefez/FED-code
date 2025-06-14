using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;

namespace JanuarMAUI.Repositories;

public class HabitEntryRepository : IHabitEntryRepository
{
    private readonly IDatabaseService _databaseService;

    public HabitEntryRepository(IDatabaseService databaseService)
    {
        _databaseService = databaseService;
    }

    public async Task<List<HabitEntry>> GetAllAsync()
    {
        var database = await _databaseService.GetConnectionAsync();
        return await database.Table<HabitEntry>().OrderByDescending(he => he.Date).ToListAsync();
    }

    public async Task<List<HabitEntry>> GetByHabitIdAsync(long habitId)
    {
        var database = await _databaseService.GetConnectionAsync();
        return await database.Table<HabitEntry>()
            .Where(he => he.HabitId == habitId)
            .OrderByDescending(he => he.Date)
            .ToListAsync();
    }

    public async Task<HabitEntry?> GetByHabitIdAndDateAsync(long habitId, DateTime date)
    {
        var database = await _databaseService.GetConnectionAsync();
        var dateOnly = date.Date;
        return await database.Table<HabitEntry>()
            .Where(he => he.HabitId == habitId && he.Date.Date == dateOnly)
            .FirstOrDefaultAsync();
    }

    public async Task<long> CreateAsync(HabitEntry habitEntry)
    {
        var database = await _databaseService.GetConnectionAsync();
        habitEntry.CreatedAt = DateTime.Now;
        habitEntry.UpdatedAt = DateTime.Now;
        await database.InsertAsync(habitEntry);
        return habitEntry.HabitEntryId;
    }

    public async Task<bool> UpdateAsync(HabitEntry habitEntry)
    {
        var database = await _databaseService.GetConnectionAsync();
        habitEntry.UpdatedAt = DateTime.Now;
        var result = await database.UpdateAsync(habitEntry);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var database = await _databaseService.GetConnectionAsync();
        var result = await database.DeleteAsync<HabitEntry>(id);
        return result > 0;
    }

    public async Task<List<HabitEntry>> GetByDateRangeAsync(long habitId, DateTime startDate, DateTime endDate)
    {
        var database = await _databaseService.GetConnectionAsync();
        var startDateOnly = startDate.Date;
        var endDateOnly = endDate.Date;
        
        return await database.Table<HabitEntry>()
            .Where(he => he.HabitId == habitId && 
                        he.Date.Date >= startDateOnly && 
                        he.Date.Date <= endDateOnly)
            .OrderBy(he => he.Date)
            .ToListAsync();
    }
} 