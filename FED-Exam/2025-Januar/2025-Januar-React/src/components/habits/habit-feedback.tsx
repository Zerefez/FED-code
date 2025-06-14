import { calculateStreakInfo } from '@/lib/streak-utils';
import { HabitEntry } from '@/services/habit-entry-service';
import { Habit } from '@/services/habit-service';
import { HabitCalendar } from './habit-calendar';
import { HabitStreakInfo } from './habit-streak-info';

interface HabitFeedbackProps {
  habit: Habit;
  habitEntries: HabitEntry[];
}

export function HabitFeedback({ habit, habitEntries }: HabitFeedbackProps) {
  const streakInfo = calculateStreakInfo(habit.id, habitEntries, habit.startDate, habit.frequency);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Streak Information */}
        <HabitStreakInfo habit={habit} streakInfo={streakInfo} />
        
        {/* Calendar View */}
        <HabitCalendar 
          habit={habit}
          habitEntries={habitEntries}
        />
      </div>
    </div>
  );
} 