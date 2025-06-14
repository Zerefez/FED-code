import { apiClient } from './api-client';

// Habit entry interface matching the database structure
export interface HabitEntry {
  id: string;
  date: string;
  habitId: string;
  completed: boolean;
  reason?: string; // Optional reason when not completed
}

// Create habit entry data interface (without id)
export interface CreateHabitEntryData {
  date: string;
  habitId: string;
  completed: boolean;
  reason?: string; // Optional reason when not completed
}

// Update habit entry data interface (partial habit entry data)
export interface UpdateHabitEntryData {
  date?: string;
  habitId?: string;
  completed?: boolean;
  reason?: string; // Optional reason when not completed
}

// Predefined reasons for not completing habits
export const HABIT_NOT_COMPLETED_REASONS = [
  { value: 'syg', label: 'Syg' },
  { value: 'paa-ferie', label: 'På ferie' },
  { value: 'havde-ikke-tid', label: 'Havde ikke tid' },
  { value: 'gad-ikke', label: 'Gad ikke' },
  { value: 'glemte-det', label: 'Glemte det' },
  { value: 'andet', label: 'Andet' }
] as const;

export type HabitNotCompletedReason = typeof HABIT_NOT_COMPLETED_REASONS[number]['value'];

// Habit entry service class with all habit-entry-related operations
export class HabitEntryService {
  private static readonly ENDPOINT = '/HabitEntries';

  // Create a new habit entry
  static async create(entryData: CreateHabitEntryData): Promise<HabitEntry> {
    try {
      return await apiClient.post<HabitEntry>(HabitEntryService.ENDPOINT, entryData);
    } catch (error) {
      console.error('Error creating habit entry:', error);
      throw error;
    }
  }

  // Get all habit entries
  static async getAll(): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(HabitEntryService.ENDPOINT);
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      throw error;
    }
  }

  // Get habit entry by ID
  static async getById(id: string): Promise<HabitEntry> {
    try {
      return await apiClient.get<HabitEntry>(`${HabitEntryService.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error fetching habit entry:', error);
      throw error;
    }
  }

  // Get habit entries by habit ID
  static async getByHabitId(habitId: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(HabitEntryService.ENDPOINT, { habitId });
    } catch (error) {
      console.error('Error fetching habit entries by habit:', error);
      throw error;
    }
  }

  // Get habit entries by date
  static async getByDate(date: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(HabitEntryService.ENDPOINT, { date });
    } catch (error) {
      console.error('Error fetching habit entries by date:', error);
      throw error;
    }
  }

  // Get habit entries by date range
  static async getByDateRange(startDate: string, endDate: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(HabitEntryService.ENDPOINT, { 
        date_gte: startDate,
        date_lte: endDate 
      });
    } catch (error) {
      console.error('Error fetching habit entries by date range:', error);
      throw error;
    }
  }

  // Get completed habit entries
  static async getCompleted(): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(HabitEntryService.ENDPOINT, { completed: 'true' });
    } catch (error) {
      console.error('Error fetching completed habit entries:', error);
      throw error;
    }
  }

  // Get habit entries by habit ID and date
  static async getByHabitIdAndDate(habitId: string, date: string): Promise<HabitEntry[]> {
    try {
      // Extract just the date part for comparison (YYYY-MM-DD)
      const targetDate = new Date(date).toISOString().split('T')[0];
      
      // Get all entries for this habit
      const habitEntries = await apiClient.get<HabitEntry[]>(HabitEntryService.ENDPOINT, { habitId });
      
      // Filter by date
      const matchingEntries = habitEntries.filter(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === targetDate;
      });
      
      return matchingEntries;
    } catch (error) {
      console.error('Error fetching habit entry by habit and date:', error);
      throw error;
    }
  }

  // Update habit entry
  static async update(id: string, entryData: UpdateHabitEntryData): Promise<HabitEntry> {
    try {
      return await apiClient.patch<HabitEntry>(`${HabitEntryService.ENDPOINT}/${id}`, entryData);
    } catch (error) {
      console.error('Error updating habit entry:', error);
      throw error;
    }
  }

  // Delete habit entry
  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${HabitEntryService.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting habit entry:', error);
      throw error;
    }
  }

  // Remove/undo habit entry for a specific date - completely deletes the entry
  static async undoHabitEntry(habitId: string, date: string = new Date().toISOString()): Promise<void> {
    try {
      // Find existing entries for this habit and date
      const existingEntries = await HabitEntryService.getByHabitIdAndDate(habitId, date);
      
      // Delete all entries for this habit on this date
      for (const entry of existingEntries) {
        await HabitEntryService.delete(entry.id);
      }
    } catch (error) {
      console.error('Error undoing habit entry:', error);
      throw error;
    }
  }

  // Mark habit as completed for a specific date
  static async markCompleted(habitId: string, date: string = new Date().toISOString()): Promise<HabitEntry> {
    try {
      // Check if entry already exists for this habit and date
      const existingEntries = await HabitEntryService.getByHabitIdAndDate(habitId, date);
      
      if (existingEntries.length > 0) {
        // Update the most recent existing entry - remove reason when completing
        const latestEntry = existingEntries[existingEntries.length - 1];
        return await HabitEntryService.update(latestEntry.id, { 
          completed: true, 
          reason: undefined 
        });
      } else {
        // Create new entry
        return await HabitEntryService.create({ habitId, date, completed: true });
      }
    } catch (error) {
      console.error('Error marking habit as completed:', error);
      throw error;
    }
  }

  // Mark habit as incomplete for a specific date with optional reason
  static async markIncomplete(habitId: string, date: string = new Date().toISOString(), reason?: string): Promise<HabitEntry> {
    try {
      // Check if entry already exists for this habit and date
      const existingEntries = await HabitEntryService.getByHabitIdAndDate(habitId, date);
      
      if (existingEntries.length > 0) {
        // Update the most recent existing entry
        const latestEntry = existingEntries[existingEntries.length - 1];
        return await HabitEntryService.update(latestEntry.id, { 
          completed: false, 
          reason 
        });
      } else {
        // Create new entry
        return await HabitEntryService.create({ habitId, date, completed: false, reason });
      }
    } catch (error) {
      console.error('Error marking habit as incomplete:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const createHabitEntry = HabitEntryService.create;
export const getAllHabitEntries = HabitEntryService.getAll;
export const getHabitEntryById = HabitEntryService.getById;
export const getHabitEntriesByHabitId = HabitEntryService.getByHabitId;
export const getHabitEntriesByDate = HabitEntryService.getByDate;
export const getHabitEntriesByDateRange = HabitEntryService.getByDateRange;
export const getCompletedHabitEntries = HabitEntryService.getCompleted;
export const updateHabitEntry = HabitEntryService.update;
export const deleteHabitEntry = HabitEntryService.delete;
export const markHabitCompleted = HabitEntryService.markCompleted;
export const markHabitIncomplete = HabitEntryService.markIncomplete;
export const undoHabitEntry = HabitEntryService.undoHabitEntry; 