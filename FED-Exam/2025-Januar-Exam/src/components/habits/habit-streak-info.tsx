import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFrequencyDescription } from '@/lib/frequency-utils';
import { StreakInfo } from '@/lib/streak-utils';
import { Habit } from '@/services/habit-service';
import { Calendar, Flame, Target, TrendingUp, Trophy } from 'lucide-react';

interface HabitStreakInfoProps {
  habit: Habit;
  streakInfo: StreakInfo;
}

export function HabitStreakInfo({ habit, streakInfo }: HabitStreakInfoProps) {
  const { currentStreak, longestStreak, lastCompletionDate, expectedThisWeek, completedThisWeek, completionRate } = streakInfo;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Rækkefølge for {habit.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Interval: {getFrequencyDescription(habit.frequency)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Nuværende rækkefølge
            </span>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-medium ${
            currentStreak > 0 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}>
            {currentStreak} {currentStreak === 1 ? 'gang' : 'gange'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Længste rækkefølge
            </span>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium border border-border bg-background">
            {longestStreak} {longestStreak === 1 ? 'gang' : 'gange'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Denne uge
            </span>
          </div>
          <span className="text-sm font-medium">
            {completedThisWeek} / {expectedThisWeek} dage
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Gennemførelsesrate (uge)
            </span>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
            completionRate >= 80 
              ? 'bg-green-100 text-green-800' 
              : completionRate >= 60 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {completionRate}%
          </span>
        </div>
        
        {lastCompletionDate && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Sidst gennemført
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDateForDisplay(lastCompletionDate)}
            </span>
          </div>
        )}
        
        {/* Motivational messages */}
        {currentStreak === 0 && longestStreak > 0 && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            💪 Du havde en fantastisk rækkefølge på {longestStreak} {longestStreak === 1 ? 'gang' : 'gange'}! 
            Du kan gøre det igen.
          </div>
        )}
        
        {currentStreak > 0 && currentStreak === longestStreak && longestStreak > 1 && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
            🔥 Du er på din bedste rækkefølge! Fortsæt det gode arbejde!
          </div>
        )}

        {completionRate >= 80 && expectedThisWeek > 0 && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
            🎯 Fantastisk! Du har en høj gennemførelsesrate denne uge.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
} 