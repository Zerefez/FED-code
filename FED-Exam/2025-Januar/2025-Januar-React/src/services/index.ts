// Export API client
export { apiClient, ApiError } from './api-client';

// Export User service and types
export {
  checkEmailExists, deleteUser, getAllUsers,
  getUserById, loginUser, registerUser, updateUser, UserService, type LoginUserData, type RegisterUserData, type UpdateUserData, type User
} from './user-service';

// Export Habit service and types
export {
  createHabit, deleteHabit, getAllHabits,
  getHabitById,
  getHabitsByUserId, HabitService, searchHabitsByName, updateHabit, type CreateHabitData, type Habit, type UpdateHabitData
} from './habit-service';

// Export Habit Entry service and types
export {
  createHabitEntry, deleteHabitEntry, getAllHabitEntries, getCompletedHabitEntries, getHabitEntriesByDate,
  getHabitEntriesByDateRange, getHabitEntriesByHabitId, getHabitEntryById, HabitEntryService, markHabitCompleted,
  markHabitIncomplete, updateHabitEntry, type CreateHabitEntryData, type HabitEntry, type UpdateHabitEntryData
} from './habit-entry-service';

