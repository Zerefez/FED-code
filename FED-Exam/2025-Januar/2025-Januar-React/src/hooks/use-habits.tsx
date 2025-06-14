import { useAuth } from '@/hooks/use-auth';
import { formatDateString, getDaysAgo, getTodayString } from '@/lib/date-utils';
import { HabitEntry, HabitEntryService, type HabitNotCompletedReason } from '@/services/habit-entry-service';
import { Habit, HabitService } from '@/services/habit-service';
import { useEffect, useState } from 'react';

export interface HabitStats {
  activeHabits: number;
  completedToday: number;
  weeklyCompletionRate: number;
}

export interface UseHabitsReturn {
  habits: Habit[];
  habitEntries: HabitEntry[];
  loading: boolean;
  updatingHabits: Set<string>;
  stats: HabitStats;
  isHabitCompletedToday: (habitId: string) => boolean;
  getTodayHabitEntry: (habitId: string) => HabitEntry | undefined;
  hasHabitEntryToday: (habitId: string) => boolean;
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  undoHabitCompletion: (habitId: string) => Promise<void>;
  handleReasonSelected: (habitId: string, reason: HabitNotCompletedReason) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useHabits(): UseHabitsReturn {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingHabits, setUpdatingHabits] = useState<Set<string>>(new Set());

  const today = getTodayString();

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const [userHabits, allEntries] = await Promise.all([
        HabitService.getByUserId(user.id),
        HabitEntryService.getAll()
      ]);
      
      // Filter habit entries to only include entries for the current user's habits
      const userHabitIds = userHabits.map(habit => habit.id);
      const userHabitEntries = allEntries.filter(entry => 
        userHabitIds.includes(entry.habitId)
      );
      
      setHabits(userHabits);
      setHabitEntries(userHabitEntries);
    } catch (error) {
      console.error('Error fetching habits data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const getTodayHabitEntry = (habitId: string): HabitEntry | undefined => {
    const todayEntries = habitEntries.filter(entry => {
      const entryDate = formatDateString(entry.date);
      return entryDate === today && entry.habitId === habitId;
    });
    
    if (todayEntries.length > 0) {
      return todayEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }
    
    return undefined;
  };

  const isHabitCompletedToday = (habitId: string): boolean => {
    const todayEntry = getTodayHabitEntry(habitId);
    return todayEntry?.completed === true;
  };

  const hasHabitEntryToday = (habitId: string): boolean => {
    return getTodayHabitEntry(habitId) !== undefined;
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (updatingHabits.has(habitId)) return;
    
    const isCurrentlyCompleted = isHabitCompletedToday(habitId);
    
    setUpdatingHabits(prev => new Set(prev).add(habitId));
    
    try {
      if (!isCurrentlyCompleted) {
        await HabitEntryService.markCompleted(habitId, new Date().toISOString());
      }
      
      // Refresh data to get updated entries
      await fetchData();
    } catch (error) {
      console.error('Error updating habit completion:', error);
    } finally {
      setUpdatingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  };

  const undoHabitCompletion = async (habitId: string) => {
    if (updatingHabits.has(habitId)) return;
    
    setUpdatingHabits(prev => new Set(prev).add(habitId));
    
    try {
      await HabitEntryService.undoHabitEntry(habitId, new Date().toISOString());
      
      // Refresh data to get updated entries
      await fetchData();
    } catch (error) {
      console.error('Error undoing habit completion:', error);
    } finally {
      setUpdatingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  };

  const handleReasonSelected = async (habitId: string, reason: HabitNotCompletedReason) => {
    setUpdatingHabits(prev => new Set(prev).add(habitId));
    
    try {
      await HabitEntryService.markIncomplete(habitId, new Date().toISOString(), reason);
      
      // Refresh data to get updated entries
      await fetchData();
    } catch (error) {
      console.error('Error updating habit with reason:', error);
    } finally {
      setUpdatingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  };

  // Calculate statistics
  const stats: HabitStats = {
    activeHabits: habits.length,
    completedToday: habits.filter(habit => isHabitCompletedToday(habit.id)).length,
    weeklyCompletionRate: (() => {
      const weekAgo = getDaysAgo(7);
      
      const userHabitIds = habits.map(h => h.id);
      const thisWeekEntries = habitEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekAgo && userHabitIds.includes(entry.habitId);
      });
      
      const completedThisWeek = thisWeekEntries.filter(entry => entry.completed).length;
      const totalPossibleThisWeek = habits.length * 7;
      return totalPossibleThisWeek > 0 
        ? Math.round((completedThisWeek / totalPossibleThisWeek) * 100) 
        : 0;
    })()
  };

  return {
    habits,
    habitEntries,
    loading,
    updatingHabits,
    stats,
    isHabitCompletedToday,
    getTodayHabitEntry,
    hasHabitEntryToday,
    toggleHabitCompletion,
    undoHabitCompletion,
    handleReasonSelected,
    refreshData: fetchData
  };
} 