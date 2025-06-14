import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@/hooks/use-form';
import { formatDateString } from '@/lib/date-utils';
import { FREQUENCY_OPTIONS } from '@/lib/frequency-utils';
import { Habit, updateHabit } from '@/services/habit-service';
import { useState } from 'react';

interface EditHabitFormProps {
  habit: Habit;
  onHabitUpdated: () => void;
  onCancel: () => void;
}

interface EditHabitFormData {
  name: string;
  description: string;
  startDate: string;
  frequency: string;
}

export function EditHabitForm({ habit, onHabitUpdated, onCancel }: EditHabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { formData, handleInputChange, resetForm } = useForm<EditHabitFormData>({
    name: habit.name,
    description: habit.description,
    startDate: formatDateString(habit.startDate),
    frequency: habit.frequency
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleInputChange(name as keyof EditHabitFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Vaneens navn er påkrævet');
      return;
    }

    if (!formData.description.trim()) {
      setError('Beskrivelse er påkrævet');
      return;
    }

    if (!formData.startDate) {
      setError('Startdato er påkrævet');
      return;
    }

    if (!formData.frequency) {
      setError('Frekvens er påkrævet');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateHabit(habit.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        frequency: formData.frequency
      });

      onHabitUpdated();
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Der opstod en fejl ved opdatering af vanen. Prøv igen senere.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Rediger Vane</CardTitle>
        <CardDescription>
          Opdater informationen for din vane
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Navn på vane *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="F.eks. Motion, Læsning, Meditation"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse *</Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Beskriv din vane i detaljer"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Hvor ofte vil du udføre denne vane? *</Label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Vælg frekvens</option>
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Startdato *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Opdaterer...' : 'Gem Ændringer'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuller
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 