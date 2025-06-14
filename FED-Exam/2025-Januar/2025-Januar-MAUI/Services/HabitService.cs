using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;

namespace JanuarMAUI.Services;

public class HabitService : IHabitService
{
    private readonly IHabitRepository _habitRepository;
    private readonly IHabitEntryRepository _habitEntryRepository;

    public HabitService(IHabitRepository habitRepository, IHabitEntryRepository habitEntryRepository)
    {
        _habitRepository = habitRepository;
        _habitEntryRepository = habitEntryRepository;
    }

    public async Task<List<Habit>> GetAllHabitsAsync()
    {
        return await _habitRepository.GetAllAsync();
    }

    public async Task<Habit?> GetHabitByIdAsync(long id)
    {
        return await _habitRepository.GetByIdAsync(id);
    }

    public async Task<bool> CreateHabitAsync(string name, string description, DateTime startDate)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(description))
                return false;

            var habit = new Habit
            {
                Name = name.Trim(),
                Description = description.Trim(),
                StartDate = startDate.Date,
                LongestStreak = 0,
                CurrentStreak = 0
            };

            var result = await _habitRepository.CreateAsync(habit);
            return result > 0;
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            System.Diagnostics.Debug.WriteLine($"Error creating habit: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            throw; // Re-throw to be handled by the calling method
        }
    }

    public async Task<bool> UpdateHabitAsync(Habit habit)
    {
        if (habit == null || string.IsNullOrWhiteSpace(habit.Name) || string.IsNullOrWhiteSpace(habit.Description))
            return false;

        return await _habitRepository.UpdateAsync(habit);
    }

    public async Task<bool> DeleteHabitAsync(long id)
    {
        return await _habitRepository.DeleteAsync(id);
    }

    public async Task<bool> MarkHabitCompletedAsync(long habitId, DateTime date)
    {
        var existingEntry = await _habitEntryRepository.GetByHabitIdAndDateAsync(habitId, date);
        
        if (existingEntry != null)
        {
            existingEntry.Completed = true;
            await _habitEntryRepository.UpdateAsync(existingEntry);
        }
        else
        {
            var habitEntry = new HabitEntry
            {
                HabitId = habitId,
                Date = date.Date,
                Completed = true
            };
            await _habitEntryRepository.CreateAsync(habitEntry);
        }

        await UpdateStreaksAsync(habitId);
        return true;
    }

    public async Task<bool> MarkHabitNotCompletedAsync(long habitId, DateTime date)
    {
        var existingEntry = await _habitEntryRepository.GetByHabitIdAndDateAsync(habitId, date);
        
        if (existingEntry != null)
        {
            existingEntry.Completed = false;
            await _habitEntryRepository.UpdateAsync(existingEntry);
        }
        else
        {
            var habitEntry = new HabitEntry
            {
                HabitId = habitId,
                Date = date.Date,
                Completed = false
            };
            await _habitEntryRepository.CreateAsync(habitEntry);
        }

        await UpdateStreaksAsync(habitId);
        return true;
    }

    public async Task<long> GetCurrentStreakAsync(long habitId)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId);
        if (habit == null) return 0;

        return habit.CurrentStreak;
    }

    public async Task<long> GetLongestStreakAsync(long habitId)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId);
        if (habit == null) return 0;

        return habit.LongestStreak;
    }

    public async Task<List<HabitEntry>> GetHabitEntriesAsync(long habitId, DateTime startDate, DateTime endDate)
    {
        return await _habitEntryRepository.GetByDateRangeAsync(habitId, startDate, endDate);
    }

    public async Task<bool> IsHabitCompletedOnDateAsync(long habitId, DateTime date)
    {
        var entry = await _habitEntryRepository.GetByHabitIdAndDateAsync(habitId, date);
        return entry?.Completed ?? false;
    }

    private async Task UpdateStreaksAsync(long habitId)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId);
        if (habit == null) return;

        var entries = await _habitEntryRepository.GetByHabitIdAsync(habitId);
        var completedEntries = entries.Where(e => e.Completed).OrderByDescending(e => e.Date).ToList();

        // Calculate current streak
        long currentStreak = 0;
        var today = DateTime.Today;
        var checkDate = today;

        while (true)
        {
            var entry = completedEntries.FirstOrDefault(e => e.Date.Date == checkDate);
            if (entry == null || !entry.Completed)
                break;

            currentStreak++;
            checkDate = checkDate.AddDays(-1);
        }

        // Calculate longest streak
        long longestStreak = 0;
        long tempStreak = 0;
        
        var allDates = completedEntries.Select(e => e.Date.Date).Distinct().OrderBy(d => d).ToList();
        DateTime? previousDate = null;

        foreach (var date in allDates)
        {
            if (previousDate == null || date == previousDate.Value.AddDays(1))
            {
                tempStreak++;
                longestStreak = Math.Max(longestStreak, tempStreak);
            }
            else
            {
                tempStreak = 1;
            }
            previousDate = date;
        }

        habit.CurrentStreak = currentStreak;
        habit.LongestStreak = Math.Max(longestStreak, habit.LongestStreak);
        
        await _habitRepository.UpdateAsync(habit);
    }
} 