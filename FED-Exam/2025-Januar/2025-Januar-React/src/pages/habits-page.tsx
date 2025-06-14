import { ReasonSelector } from '@/components/common/reason-selector';
import { AddHabitForm } from '@/components/habits/add-habit-form';
import { DeleteHabitDialog } from '@/components/habits/delete-habit-dialog';
import { EditHabitForm } from '@/components/habits/edit-habit-form';
import { HabitFeedback } from '@/components/habits/habit-feedback';
import { HabitHistory } from '@/components/habits/habit-history';
import { HabitList } from '@/components/habits/habit-list';
import { StatsCards } from '@/components/habits/stats-cards';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useHabits } from '@/hooks/use-habits';
import { type HabitNotCompletedReason } from '@/services/habit-entry-service';
import { Habit } from '@/services/habit-service';
import { useState } from 'react';

export function HabitsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReasonSelector, setShowReasonSelector] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const {
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
    refreshData
  } = useHabits();

  const handleHabitAdded = () => {
    setShowAddForm(false);
    refreshData();
  };

  const handleHabitUpdated = () => {
    setEditingHabit(null);
    refreshData();
  };

  const handleHabitDeleted = () => {
    setDeletingHabit(null);
    refreshData();
  };

  const showReasonSelectorForHabit = (habitId: string) => {
    setShowReasonSelector(habitId);
  };

  const onReasonSelected = async (habitId: string, reason: HabitNotCompletedReason) => {
    await handleReasonSelected(habitId, reason);
    setShowReasonSelector(null);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleDeleteHabit = (habit: Habit) => {
    setDeletingHabit(habit);
  };

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
  const selectedHabit = showReasonSelector 
    ? habits.find(h => h.id === showReasonSelector) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mine Vaner</h2>
          <p className="text-muted-foreground">
            Oversigt over dine daglige vaner og fremskridt
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Tilføj Vane
        </Button>
      </div>

      {/* Statistics */}
      <StatsCards stats={stats} />

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Ingen vaner endnu
          </h3>
          <p className="text-muted-foreground mb-4">
            Opret din første vane for at komme i gang med at tracke dine daglige rutiner.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Opret din første vane
          </Button>
        </div>
      ) : (
        <>
          {/* Current Habits - Full Width */}
          <HabitList
            habits={habits}
            updatingHabits={updatingHabits}
            isHabitCompletedToday={isHabitCompletedToday}
            getTodayHabitEntry={getTodayHabitEntry}
            hasHabitEntryToday={hasHabitEntryToday}
            onToggleCompletion={toggleHabitCompletion}
            onUndoCompletion={undoHabitCompletion}
            onShowReasonSelector={showReasonSelectorForHabit}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
          />
          
          {/* Habit Feedback Section */}
          <div className="space-y-8">
            <div className="border-t pt-6">
              <h3 className="text-2xl font-bold tracking-tight mb-6">📊 Feedback på dine vaner</h3>
              <p className="text-muted-foreground mb-8">
                Se hvordan du klarer dig med dine vaner - streaks og kalender visning
              </p>
              
              <div className="space-y-8">
                {habits.map((habit) => (
                  <div key={habit.id} className="space-y-4">
                    <h4 className="text-xl font-semibold">{habit.name}</h4>
                    <HabitFeedback habit={habit} habitEntries={habitEntries} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Activity History - Full Width at Bottom */}
          <HabitHistory habits={habits} habitEntries={habitEntries} />
        </>
      )}

      {/* Add Habit Modal */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Tilføj ny vane">
        <AddHabitForm
          onHabitAdded={handleHabitAdded}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Edit Habit Modal */}
      <Modal 
        isOpen={!!editingHabit} 
        onClose={() => setEditingHabit(null)} 
        title="Rediger vane"
      >
        {editingHabit && (
          <EditHabitForm
            habit={editingHabit}
            onHabitUpdated={handleHabitUpdated}
            onCancel={() => setEditingHabit(null)}
          />
        )}
      </Modal>

      {/* Delete Habit Dialog */}
      <DeleteHabitDialog
        habit={deletingHabit}
        isOpen={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        onHabitDeleted={handleHabitDeleted}
      />

      {/* Reason Selector Modal */}
      <Modal isOpen={!!showReasonSelector} onClose={() => setShowReasonSelector(null)} title="Årsag til ikke gennemført">
        {selectedHabit && (
          <ReasonSelector
            habitName={selectedHabit.name}
            onReasonSelected={(reason) => onReasonSelected(selectedHabit.id, reason)}
            onCancel={() => setShowReasonSelector(null)}
          />
        )}
      </Modal>
    </div>
  );
} 