import { AddHabitForm } from '@/components/add-habit-form';
import { ReasonSelector } from '@/components/reason-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/hooks/use-auth';
import { HABIT_NOT_COMPLETED_REASONS, HabitEntry, HabitEntryService, type HabitNotCompletedReason } from '@/services/habit-entry-service';
import { Habit, HabitService } from '@/services/habit-service';
import { useEffect, useState } from 'react';

export function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [updatingHabits, setUpdatingHabits] = useState<Set<string>>(new Set());
  const [showReasonSelector, setShowReasonSelector] = useState<string | null>(null); // habitId for which to show reason selector

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch user's habits and all habit entries
      const [userHabits, allEntries] = await Promise.all([
        HabitService.getByUserId(user.id),
        HabitEntryService.getAll()
      ]);
      
      setHabits(userHabits);
      setHabitEntries(allEntries);
    } catch (error) {
      console.error('Error fetching habits data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleHabitAdded = () => {
    setShowAddForm(false);
    fetchData(); // Refresh the habits list
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Function to check if a habit is completed today
  const isHabitCompletedToday = (habitId: string): boolean => {
    const todayEntry = getTodayHabitEntry(habitId);
    return todayEntry?.completed === true;
  };

  // Function to get today's habit entry (most recent one if multiple exist)
  const getTodayHabitEntry = (habitId: string): HabitEntry | undefined => {
    const todayEntries = habitEntries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === today && entry.habitId === habitId;
    });
    
    // Return the most recent entry if multiple exist
    if (todayEntries.length > 0) {
      return todayEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }
    
    return undefined;
  };

  // Function to check if habit has any entry today (completed or incomplete)
  const hasHabitEntryToday = (habitId: string): boolean => {
    return getTodayHabitEntry(habitId) !== undefined;
  };

  // Function to get reason label from reason value
  const getReasonLabel = (reason: string): string => {
    const reasonOption = HABIT_NOT_COMPLETED_REASONS.find(r => r.value === reason);
    return reasonOption?.label || reason;
  };

  // Function to toggle habit completion
  const toggleHabitCompletion = async (habitId: string) => {
    if (updatingHabits.has(habitId)) return; // Prevent multiple updates
    
    const isCurrentlyCompleted = isHabitCompletedToday(habitId);
    
    setUpdatingHabits(prev => new Set(prev).add(habitId));
    
    try {
      if (isCurrentlyCompleted) {
        // This should not happen anymore - "Fortryd" has its own function
        return;
      } else {
        // Mark as completed
        await HabitEntryService.markCompleted(habitId, new Date().toISOString());
      }
      
      // Refresh habit entries to show updated status
      const updatedEntries = await HabitEntryService.getAll();
      setHabitEntries(updatedEntries);
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

  // Function to undo/remove habit entry completely
  const undoHabitCompletion = async (habitId: string) => {
    if (updatingHabits.has(habitId)) return; // Prevent multiple updates
    
    setUpdatingHabits(prev => new Set(prev).add(habitId));
    
    try {
      await HabitEntryService.undoHabitEntry(habitId, new Date().toISOString());
      
      // Refresh habit entries to show updated status
      const updatedEntries = await HabitEntryService.getAll();
      setHabitEntries(updatedEntries);
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

  // Function to show reason selector for marking habit as incomplete with reason
  const showReasonSelectorForHabit = (habitId: string) => {
    setShowReasonSelector(habitId);
  };

  // Function to handle reason selection for incomplete habit
  const handleReasonSelected = async (habitId: string, reason: HabitNotCompletedReason) => {
    setUpdatingHabits(prev => new Set(prev).add(habitId));
    
    try {
      await HabitEntryService.markIncomplete(habitId, new Date().toISOString(), reason);
      
      // Refresh habit entries to show updated status
      const updatedEntries = await HabitEntryService.getAll();
      setHabitEntries(updatedEntries);
      
      setShowReasonSelector(null); // Hide reason selector
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
  const activeHabits = habits.length;
  
  // Count actually completed habits today (not just any entries)
  const completedToday = habits.filter(habit => isHabitCompletedToday(habit.id)).length;
  
  // Calculate weekly completion rate
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const userHabitIds = habits.map(h => h.id);
  const thisWeekEntries = habitEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekAgo && userHabitIds.includes(entry.habitId);
  });
  
  const completedThisWeek = thisWeekEntries.filter(entry => entry.completed).length;
  const totalPossibleThisWeek = habits.length * 7; // 7 days * number of habits
  const weeklyCompletionRate = totalPossibleThisWeek > 0 
    ? Math.round((completedThisWeek / totalPossibleThisWeek) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mine Vaner</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Get habit name for modal
  const selectedHabit = showReasonSelector ? habits.find(h => h.id === showReasonSelector) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mine Vaner</h2>
          <p className="text-muted-foreground">
            Administrer dine vaner og spor dit fremskridt, {user?.firstName}!
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            Tilføj ny vane
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddHabitForm 
          onHabitAdded={handleHabitAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Reason Selector Modal */}
      <Modal
        isOpen={!!showReasonSelector}
        onClose={() => setShowReasonSelector(null)}
        title="Hvorfor blev vanen ikke gennemført?"
      >
        {selectedHabit && (
          <ReasonSelector
            habitName={selectedHabit.name}
            onReasonSelected={(reason) => {
              if (showReasonSelector) {
                handleReasonSelected(showReasonSelector, reason);
              }
            }}
            onCancel={() => setShowReasonSelector(null)}
            isLoading={showReasonSelector ? updatingHabits.has(showReasonSelector) : false}
          />
        )}
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktive Vaner</CardTitle>
            <CardDescription>
              Vaner du arbejder på i øjeblikket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHabits}</div>
            <p className="text-xs text-muted-foreground">
              {activeHabits === 0 ? 'Ingen aktive vaner endnu' : `${activeHabits} aktive vaner`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gennemførte i dag</CardTitle>
            <CardDescription>
              Vaner gennemført i dag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">
              af {activeHabits} planlagte vaner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Denne uge</CardTitle>
            <CardDescription>
              Gennemsnit denne uge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Gennemførelsesrate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Habits - Quick completion section */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>I dag ({new Date().toLocaleDateString('da-DK')})</CardTitle>
            <CardDescription>
              Marker dine vaner som gennemført for i dag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = isHabitCompletedToday(habit.id);
                const isUpdating = updatingHabits.has(habit.id);
                const todayEntry = getTodayHabitEntry(habit.id);
                
                return (
                  <div 
                    key={habit.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isCompleted ? 'bg-green-50 border-green-200' : 
                      todayEntry && !todayEntry.completed ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${
                          isCompleted ? 'text-green-800' : 
                          todayEntry && !todayEntry.completed ? 'text-red-800' : ''
                        }`}>
                          {habit.name}
                        </h3>
                        {isCompleted && (
                          <span className="text-green-600 text-lg">✓</span>
                        )}
                        {todayEntry && !todayEntry.completed && (
                          <span className="text-red-600 text-lg">✗</span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isCompleted ? 'text-green-600' : 
                        todayEntry && !todayEntry.completed ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {habit.description}
                      </p>
                      {todayEntry && !todayEntry.completed && todayEntry.reason && (
                        <p className="text-xs text-red-500 mt-1">
                          Årsag: {getReasonLabel(todayEntry.reason)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {hasHabitEntryToday(habit.id) ? (
                        // Habit has been tracked today (either completed or incomplete) - show only Fortryd
                        <Button
                          onClick={() => undoHabitCompletion(habit.id)}
                          disabled={isUpdating}
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:bg-gray-100"
                        >
                          {isUpdating ? "..." : "Fortryd"}
                        </Button>
                      ) : (
                        // Habit not tracked today - show both options
                        <>
                          <Button
                            onClick={() => toggleHabitCompletion(habit.id)}
                            disabled={isUpdating}
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-50 border-green-300 text-green-600"
                          >
                            {isUpdating ? "..." : "Marker som udført"}
                          </Button>
                          <Button
                            onClick={() => showReasonSelectorForHabit(habit.id)}
                            disabled={isUpdating}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 border-red-300"
                          >
                            Ikke gennemført
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Show completion summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  {completedToday} af {activeHabits} vaner gennemført i dag
                  {completedToday === activeHabits && activeHabits > 0 && (
                    <span className="text-green-600 font-medium"> 🎉 Alle vaner gennemført!</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display habit list */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dine Vaner</CardTitle>
            <CardDescription>
              Oversigt over dine aktive vaner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">{habit.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Startdato: {new Date(habit.startDate).toLocaleDateString('da-DK')}</span>
                    <span>Frekvens: {habit.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {habits.length === 0 && !showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ingen vaner endnu</CardTitle>
            <CardDescription>
              Kom i gang med at spore dine vaner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Du har endnu ikke oprettet nogle vaner. Klik på "Tilføj ny vane" for at komme i gang med at spore dine daglige vaner.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Opret din første vane
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 