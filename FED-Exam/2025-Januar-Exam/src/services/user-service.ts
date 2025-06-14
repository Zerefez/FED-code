import { apiClient } from './api-client';

// User interface matching the database structure
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Registration data interface (without id)
export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Login data interface
export interface LoginUserData {
  email: string;
  password: string;
}

// User update data interface (partial user data)
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

// User service class with all user-related operations
export class UserService {
  private static readonly ENDPOINT = '/users';

  // Register a new user
  static async register(userData: RegisterUserData): Promise<User> {
    try {
      return await apiClient.post<User>(UserService.ENDPOINT, userData);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Get all users
  static async getAll(): Promise<User[]> {
    try {
      return await apiClient.get<User[]>(UserService.ENDPOINT);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getById(id: string): Promise<User> {
    try {
      return await apiClient.get<User>(`${UserService.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get user by email
  static async getByEmail(email: string): Promise<User[]> {
    try {
      return await apiClient.get<User[]>(UserService.ENDPOINT, { email });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Check if email already exists
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const users = await UserService.getByEmail(email);
      return users.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  }

  // Login user (validate credentials)
  static async login(credentials: LoginUserData): Promise<User | null> {
    try {
      const users = await UserService.getByEmail(credentials.email);
      
      if (users.length === 0) {
        return null; // User not found
      }

      const user = users[0];
      
      // In a real app, you would hash the password and compare
      // For this example, we're comparing plain text passwords
      if (user.password === credentials.password) {
        return user;
      }
      
      return null; // Invalid password
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  // Update user
  static async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      return await apiClient.patch<User>(`${UserService.ENDPOINT}/${id}`, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${UserService.ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

// Export convenience functions for backward compatibility
export const registerUser = UserService.register;
export const checkEmailExists = UserService.checkEmailExists;
export const loginUser = UserService.login;
export const getAllUsers = UserService.getAll;
export const getUserById = UserService.getById;
export const updateUser = UserService.update;
export const deleteUser = UserService.delete; 