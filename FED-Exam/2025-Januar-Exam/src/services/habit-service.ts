import { apiClient } from './api-client';

// Habit interface matching the database structure
export interface Habit {
  id: string;
  name: string;
  description: string;
  startDate: string;
  frequency: string;
  userId: string;
}

// Create habit data interface (without id)
export interface CreateHabitData {
  name: string;
  description: string;
  startDate: string;
  frequency: string;
  userId: string;
}

// Update habit data interface (partial habit data)
export interface UpdateHabitData {
  name?: string;
  description?: string;
  startDate?: string;
  frequency?: string;
  userId?: string;
}

// Habit service class with all habit-related operations
export class HabitService {
  private static readonly ENDPOINT = '/habits';

  // Create a new habit
  static async create(habitData: CreateHabitData): Promise<Habit> {
    try {
      return await apiClient.post<Habit>(this.ENDPOINT, habitData);
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  // Get all habits
  static async getAll(): Promise<Habit[]> {
    try {
      return await apiClient.get<Habit[]>(this.ENDPOINT);
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  }

  // Get habit by ID
  static async getById(id: string): Promise<Habit> {
    try {
      return await apiClient.get<Habit>(`${this.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error fetching habit:', error);
      throw error;
    }
  }

  // Get habits by user ID
  static async getByUserId(userId: string): Promise<Habit[]> {
    try {
      return await apiClient.get<Habit[]>(this.ENDPOINT, { userId });
    } catch (error) {
      console.error('Error fetching habits by user:', error);
      throw error;
    }
  }

  // Update habit
  static async update(id: string, habitData: UpdateHabitData): Promise<Habit> {
    try {
      return await apiClient.patch<Habit>(`${this.ENDPOINT}/${id}`, habitData);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  // Delete habit
  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Search habits by name
  static async searchByName(name: string): Promise<Habit[]> {
    try {
      return await apiClient.get<Habit[]>(this.ENDPOINT, { name_like: name });
    } catch (error) {
      console.error('Error searching habits:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const createHabit = HabitService.create;
export const getAllHabits = HabitService.getAll;
export const getHabitById = HabitService.getById;
export const getHabitsByUserId = HabitService.getByUserId;
export const updateHabit = HabitService.update;
export const deleteHabit = HabitService.delete;
export const searchHabitsByName = HabitService.searchByName; 