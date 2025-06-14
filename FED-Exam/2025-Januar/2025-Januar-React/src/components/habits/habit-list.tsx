import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit, HabitEntry } from '@/services';
import { HABIT_NOT_COMPLETED_REASONS } from '@/services/habit-entry-service';
import { Edit, Trash2 } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  updatingHabits: Set<string>;
  isHabitCompletedToday: (habitId: string) => boolean;
  getTodayHabitEntry: (habitId: string) => HabitEntry | undefined;
  hasHabitEntryToday: (habitId: string) => boolean;
  onToggleCompletion: (habitId: string) => void;
  onUndoCompletion: (habitId: string) => void;
  onShowReasonSelector: (habitId: string) => void;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habit: Habit) => void;
}

export function HabitList({
  habits,
  updatingHabits,
  isHabitCompletedToday,
  getTodayHabitEntry,
  hasHabitEntryToday,
  onToggleCompletion,
  onUndoCompletion,
  onShowReasonSelector,
  onEditHabit,
  onDeleteHabit
}: HabitListProps) {
  // Function to get reason label from reason value
  const getReasonLabel = (reason: string): string => {
    const reasonOption = HABIT_NOT_COMPLETED_REASONS.find(r => r.value === reason);
    return reasonOption?.label || reason;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {habits.map((habit) => {
        const isCompleted = isHabitCompletedToday(habit.id);
        const hasEntry = hasHabitEntryToday(habit.id);
        const todayEntry = getTodayHabitEntry(habit.id);
        const isUpdating = updatingHabits.has(habit.id);

        return (
          <Card key={habit.id} className={`relative ${isCompleted ? 'border-green-500 bg-green-50' : hasEntry && !isCompleted ? 'border-orange-500 bg-orange-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className={isCompleted ? 'line-through text-green-700' : ''}>{habit.name}</span>
                <div className="flex items-center gap-2">
                  {isCompleted && <span className="text-green-600 text-sm">✓ Gennemført</span>}
                  {hasEntry && !isCompleted && (
                    <span className="text-orange-600 text-sm">⚠ Ikke gennemført</span>
                  )}
                  
                  {/* Administration Buttons */}
                  {(onEditHabit || onDeleteHabit) && (
                    <div className="flex gap-1">
                      {onEditHabit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onEditHabit(habit)}
                          title="Rediger vane"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDeleteHabit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteHabit(habit)}
                          title="Slet vane"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardTitle>
              <CardDescription className={isCompleted ? 'text-green-600' : ''}>
                {habit.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Show reason if habit is marked as incomplete */}
                {hasEntry && !isCompleted && todayEntry?.reason && (
                  <div className="p-2 bg-orange-100 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800">
                      <strong>Årsag:</strong> {getReasonLabel(todayEntry.reason)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!hasEntry ? (
                    // No entry for today - show both options
                    <>
                      <Button
                        onClick={() => onToggleCompletion(habit.id)}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        {isUpdating ? "Opdaterer..." : "Gennemført"}
                      </Button>
                      <Button
                        onClick={() => onShowReasonSelector(habit.id)}
                        disabled={isUpdating}
                        variant="outline"
                        className="flex-1"
                      >
                        Ikke gennemført
                      </Button>
                    </>
                  ) : isCompleted ? (
                    // Completed - only show undo option
                    <Button
                      onClick={() => onUndoCompletion(habit.id)}
                      disabled={isUpdating}
                      variant="outline"
                      className="flex-1"
                    >
                      {isUpdating ? "Opdaterer..." : "Fortryd"}
                    </Button>
                  ) : (
                    // Incomplete with reason - show undo and mark completed
                    <>
                      <Button
                        onClick={() => onToggleCompletion(habit.id)}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        {isUpdating ? "Opdaterer..." : "Gennemført"}
                      </Button>
                      <Button
                        onClick={() => onUndoCompletion(habit.id)}
                        disabled={isUpdating}
                        variant="outline"
                        className="flex-1"
                      >
                        Fortryd
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 