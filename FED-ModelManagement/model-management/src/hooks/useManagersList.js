import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { managersAPI } from '../services/api';

export default function useManagersList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const { isManager } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    async function fetchManagers() {
      try {
        setLoading(true);
        const data = await managersAPI.getAllManagers();
        setManagers(data);
        
        // If there's an ID in the URL, select that manager
        if (id) {
          const managerFromUrl = data.find(manager => manager.managerId.toString() === id);
          
          if (managerFromUrl) {
            setSelectedManager(managerFromUrl);
          } else {
            console.warn(`Manager with ID ${id} not found in the list`);
          }
        } 
        // Otherwise, select the first manager by default if available
        else if (data.length > 0) {
          setSelectedManager(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch managers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchManagers();
  }, [id]);

  const deleteManager = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    
    try {
      await managersAPI.deleteManager(id);
      // Remove from list
      setManagers(managers.filter(manager => manager.managerId !== id));
      
      // If we deleted the selected manager, select another one or set to null
      if (selectedManager && selectedManager.managerId === id) {
        if (managers.length > 1) {
          setSelectedManager(managers.find(m => m.managerId !== id) || null);
        } else {
          setSelectedManager(null);
        }
      }
    } catch (err) {
      setError('Failed to delete manager');
      console.error(err);
    }
  };

  return {
    managers,
    loading,
    error,
    selectedManager,
    setSelectedManager,
    deleteManager,
    isManager
  };
} 