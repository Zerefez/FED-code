import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateString, formatDisplayDate } from '@/lib/date-utils';
import { Habit, HabitEntry } from '@/services';
import { useState } from 'react';

interface HabitHistoryProps {
  habits: Habit[];
  habitEntries: HabitEntry[];
}

type TimePeriod = 'week' | 'month' | 'year' | 'all';

const TIME_PERIOD_OPTIONS = [
  { value: 'week' as TimePeriod, label: 'Uge', days: 7 },
  { value: 'month' as TimePeriod, label: 'Måned', days: 30 },
  { value: 'year' as TimePeriod, label: 'År', days: 365 },
  { value: 'all' as TimePeriod, label: 'Alt', days: null },
];

export function HabitHistory({ habits, habitEntries }: HabitHistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');

  // Filter entries based on selected time period
  const getFilteredEntries = () => {
    if (selectedPeriod === 'all') {
      return habitEntries;
    }

    const periodOption = TIME_PERIOD_OPTIONS.find(p => p.value === selectedPeriod);
    if (!periodOption?.days) return habitEntries;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodOption.days);

    return habitEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });
  };

  const filteredEntries = getFilteredEntries()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group entries by date
  const entriesByDate = filteredEntries.reduce((acc, entry) => {
    const dateKey = formatDateString(entry.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, HabitEntry[]>);

  // Get habit name by ID
  const getHabitName = (habitId: string): string => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.name || 'Unknown Habit';
  };

  // Get statistics for the selected period
  const getStatistics = () => {
    const totalEntries = filteredEntries.length;
    const completedEntries = filteredEntries.filter(entry => entry.completed).length;
    const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

    return { totalEntries, completedEntries, completionRate };
  };

  const { totalEntries, completedEntries, completionRate } = getStatistics();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitetshistorik</CardTitle>
        <CardDescription>
          Dine vanegennemførelser over tid
        </CardDescription>
        
        {/* Time Period Selector */}
        <div className="flex flex-wrap gap-1">
          {TIME_PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(option.value)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Statistics */}
        {totalEntries > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-semibold">{totalEntries}</div>
              <div className="text-muted-foreground">Aktiviteter</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-700">{completedEntries}</div>
              <div className="text-muted-foreground">Gennemført</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-700">{completionRate}%</div>
              <div className="text-muted-foreground">Succes</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredEntries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Ingen aktiviteter i den valgte periode
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(entriesByDate).map(([date, entries]) => (
              <div key={date} className="border-l-2 border-gray-200 pl-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {formatDisplayDate(date)}
                </h4>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-2 rounded-md text-sm ${
                        entry.completed
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={entry.completed ? '✓' : '⚠'} />
                        <span>{getHabitName(entry.habitId)}</span>
                      </div>
                      <div className="text-xs">
                        {new Date(entry.date).toLocaleTimeString('da-DK', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Europe/Copenhagen'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 