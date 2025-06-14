import { apiClient } from './api-client';

// Habit entry interface matching the database structure
export interface HabitEntry {
  id: string;
  date: string;
  habitId: string;
  completed: boolean;
}

// Create habit entry data interface (without id)
export interface CreateHabitEntryData {
  date: string;
  habitId: string;
  completed: boolean;
}

// Update habit entry data interface (partial habit entry data)
export interface UpdateHabitEntryData {
  date?: string;
  habitId?: string;
  completed?: boolean;
}

// Habit entry service class with all habit-entry-related operations
export class HabitEntryService {
  private static readonly ENDPOINT = '/HabitEntries';

  // Create a new habit entry
  static async create(entryData: CreateHabitEntryData): Promise<HabitEntry> {
    try {
      return await apiClient.post<HabitEntry>(this.ENDPOINT, entryData);
    } catch (error) {
      console.error('Error creating habit entry:', error);
      throw error;
    }
  }

  // Get all habit entries
  static async getAll(): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(this.ENDPOINT);
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      throw error;
    }
  }

  // Get habit entry by ID
  static async getById(id: string): Promise<HabitEntry> {
    try {
      return await apiClient.get<HabitEntry>(`${this.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error fetching habit entry:', error);
      throw error;
    }
  }

  // Get habit entries by habit ID
  static async getByHabitId(habitId: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(this.ENDPOINT, { habitId });
    } catch (error) {
      console.error('Error fetching habit entries by habit:', error);
      throw error;
    }
  }

  // Get habit entries by date
  static async getByDate(date: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(this.ENDPOINT, { date });
    } catch (error) {
      console.error('Error fetching habit entries by date:', error);
      throw error;
    }
  }

  // Get habit entries by date range
  static async getByDateRange(startDate: string, endDate: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(this.ENDPOINT, { 
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
      return await apiClient.get<HabitEntry[]>(this.ENDPOINT, { completed: 'true' });
    } catch (error) {
      console.error('Error fetching completed habit entries:', error);
      throw error;
    }
  }

  // Get habit entries by habit ID and date
  static async getByHabitIdAndDate(habitId: string, date: string): Promise<HabitEntry[]> {
    try {
      return await apiClient.get<HabitEntry[]>(this.ENDPOINT, { habitId, date });
    } catch (error) {
      console.error('Error fetching habit entry by habit and date:', error);
      throw error;
    }
  }

  // Update habit entry
  static async update(id: string, entryData: UpdateHabitEntryData): Promise<HabitEntry> {
    try {
      return await apiClient.patch<HabitEntry>(`${this.ENDPOINT}/${id}`, entryData);
    } catch (error) {
      console.error('Error updating habit entry:', error);
      throw error;
    }
  }

  // Delete habit entry
  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting habit entry:', error);
      throw error;
    }
  }

  // Mark habit as completed for a specific date
  static async markCompleted(habitId: string, date: string = new Date().toISOString()): Promise<HabitEntry> {
    try {
      // Check if entry already exists for this habit and date
      const existingEntries = await this.getByHabitIdAndDate(habitId, date);
      
      if (existingEntries.length > 0) {
        // Update existing entry
        return await this.update(existingEntries[0].id, { completed: true });
      } else {
        // Create new entry
        return await this.create({ habitId, date, completed: true });
      }
    } catch (error) {
      console.error('Error marking habit as completed:', error);
      throw error;
    }
  }

  // Mark habit as incomplete for a specific date
  static async markIncomplete(habitId: string, date: string = new Date().toISOString()): Promise<HabitEntry> {
    try {
      // Check if entry already exists for this habit and date
      const existingEntries = await this.getByHabitIdAndDate(habitId, date);
      
      if (existingEntries.length > 0) {
        // Update existing entry
        return await this.update(existingEntries[0].id, { completed: false });
      } else {
        // Create new entry
        return await this.create({ habitId, date, completed: false });
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