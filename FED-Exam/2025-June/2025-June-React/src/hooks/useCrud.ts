import { useEffect, useState } from 'react';

// Generic interface defining the shape of a CRUD service
// T represents the entity type, CreateData represents the data needed to create a new entity
interface CrudService<T, CreateData = Omit<T, 'id'>> {
  getAll: () => Promise<T[]>;                    // Fetch all entities
  getById: (id: string) => Promise<T>;           // Fetch single entity by ID
  create: (data: CreateData) => Promise<T>;      // Create new entity
  update: (id: string, data: Partial<T>) => Promise<T>; // Update existing entity
  delete: (id: string) => Promise<void>;         // Delete entity by ID
}

// Interface defining what the useCrud hook returns
// This provides a consistent API for CRUD operations across different entity types
interface UseCrudReturn<T, CreateData> {
  items: T[];                    // Array of all loaded entities
  loading: boolean;              // Whether any operation is in progress
  error: string | null;          // Error message if any operation failed
  
  // Actions
  load: () => Promise<void>;                           // Manually trigger data loading
  create: (data: CreateData) => Promise<T | null>;     // Create new entity, returns null on error
  update: (id: string, data: Partial<T>) => Promise<T | null>; // Update entity, returns null on error
  remove: (id: string) => Promise<boolean>;            // Delete entity, returns success boolean
  
  // Utils
  getById: (id: string) => T | undefined;              // Find entity by ID in loaded items
  refresh: () => Promise<void>;                        // Alias for load() for semantic clarity
}

// Generic custom hook that provides CRUD operations for any entity type
// This reduces code duplication by providing a standard pattern for data management
export function useCrud<T extends { id: string }, CreateData = Omit<T, 'id'>>(
  service: CrudService<T, CreateData>  // Service object that handles the actual API calls
): UseCrudReturn<T, CreateData> {
  // State to store all loaded entities
  const [items, setItems] = useState<T[]>([]);
  
  // State to track loading status for UI feedback
  const [loading, setLoading] = useState(false);
  
  // State to store error messages
  const [error, setError] = useState<string | null>(null);

  // Function to load all entities from the service
  const load = async () => {
    // Set loading state to true for UI feedback
    setLoading(true);
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Call the service to fetch all entities
      const data = await service.getAll();
      
      // Update state with the loaded data
      setItems(data);
    } catch (err) {
      // Extract error message, handling different error types
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      
      // Log error for debugging purposes
      console.error('Load error:', err);
    } finally {
      // Always set loading to false when operation completes
      setLoading(false);
    }
  };

  // Function to create a new entity
  const create = async (data: CreateData): Promise<T | null> => {
    // Clear any previous errors
    setError(null);
    
    try {
      // Call service to create the entity
      const newItem = await service.create(data);
      
      // Optimistically update local state by adding the new item
      // This provides immediate UI feedback without waiting for a refresh
      setItems(prev => [...prev, newItem]);
      
      // Return the created item for further processing
      return newItem;
    } catch (err) {
      // Extract and set error message
      const message = err instanceof Error ? err.message : 'Failed to create item';
      setError(message);
      
      // Return null to indicate failure
      return null;
    }
  };

  // Function to update an existing entity
  const update = async (id: string, data: Partial<T>): Promise<T | null> => {
    try {
      // Call service to update the entity
      const updatedItem = await service.update(id, data);
      
      // Update local state by replacing the old item with the updated one
      // Uses map to preserve array order and only update the matching item
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      
      // Return updated item for further processing
      return updatedItem;
    } catch (err) {
      // Set error message on failure
      setError('Failed to update item');
      
      // Return null to indicate failure
      return null;
    }
  };

  // Function to delete an entity
  const remove = async (id: string): Promise<boolean> => {
    try {
      // Call service to delete the entity
      await service.delete(id);
      
      // Remove item from local state
      // Uses filter to keep all items except the deleted one
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Return true to indicate success
      return true;
    } catch (err) {
      // Set error message on failure
      setError('Failed to delete item');
      
      // Return false to indicate failure
      return false;
    }
  };

  // Utility function to find an item by ID in the loaded items
  // This avoids the need for components to implement their own search logic
  const getById = (id: string): T | undefined => {
    return items.find(item => item.id === id);
  };

  // Alias for load function with more semantic naming
  const refresh = async () => {
    await load();
  };

  // Load data when the hook is first used
  // Empty dependency array means this only runs once on mount
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Return all state and functions for use by components
  return {
    items,      // Current loaded items
    loading,    // Loading state
    error,      // Error state
    load,       // Manual load function
    create,     // Create function
    update,     // Update function
    remove,     // Delete function
    getById,    // Find by ID utility
    refresh,    // Refresh alias
  };
} 