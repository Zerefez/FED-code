import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Habit, deleteHabit } from '@/services/habit-service';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteHabitDialogProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onHabitDeleted: () => void;
}

export function DeleteHabitDialog({ habit, isOpen, onClose, onHabitDeleted }: DeleteHabitDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!habit) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteHabit(habit.id);
      onHabitDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Der opstod en fejl ved sletning af vanen. Prøv igen senere.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  if (!habit) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Slet Vane">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              Er du sikker på, at du vil slette denne vane?
            </p>
            <p className="text-sm text-red-600 mt-1">
              Denne handling kan ikke fortrydes. Al data relateret til vanen vil blive slettet permanent.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Vane der skal slettes:</h4>
          <p className="font-semibold text-gray-900">{habit.name}</p>
          <p className="text-sm text-gray-600">{habit.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            Oprettet: {new Date(habit.startDate).toLocaleDateString('da-DK')} • {habit.frequency}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
          >
            Annuller
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="flex-1"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Sletter...' : 'Slet Vane'}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 