import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFrequencyDescription } from '@/lib/frequency-utils';
import { getMonthCalendarData, type CalendarDay } from '@/lib/streak-utils';
import { HabitEntry } from '@/services/habit-entry-service';
import { Habit } from '@/services/habit-service';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, MinusCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface HabitCalendarProps {
  habit: Habit;
  habitEntries: HabitEntry[];
}

export function HabitCalendar({ habit, habitEntries }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const calendarData = getMonthCalendarData(
    habit.id, 
    habitEntries, 
    year, 
    month, 
    habit.startDate, 
    habit.frequency
  );
  
  // Create month display with proper week structure
  const createMonthDisplay = (): (CalendarDay | null)[][] => {
    const weeks: (CalendarDay | null)[][] = [];
    let currentWeek: (CalendarDay | null)[] = [];
    
    // Find the first day of the month and its day of week
    const firstDayOfMonth = calendarData[0];
    const startDayOfWeek = firstDayOfMonth.dayOfWeek;
    
    // Fill in empty cells at the beginning
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    // Add all days of the month
    calendarData.forEach((day) => {
      currentWeek.push(day);
      
      // If we've filled a week (7 days), start a new week
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Fill in remaining empty cells at the end
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(null);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  const weeks = createMonthDisplay();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const getStatusIcon = (status: CalendarDay['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'missed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'expected-missed':
        return <Clock className="h-3 w-3 text-orange-500" />;
      default:
        return <MinusCircle className="h-3 w-3 text-gray-300" />;
    }
  };
  
  const getStatusColor = (status: CalendarDay['status'], isExpectedDay: boolean = false) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'missed':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'expected-missed':
        return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      default:
        return isExpectedDay 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };
  
  const monthNames = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
  ];
  
  const weekDays = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Kalender for {habit.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Interval: {getFrequencyDescription(habit.frequency)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    relative h-10 w-10 border rounded-md flex items-center justify-center
                    transition-colors duration-200
                    ${day ? `cursor-help ${getStatusColor(day.status, day.isExpectedDay)}` : 'invisible'}
                  `}
                  title={day ? `${day.date}: ${getStatusText(day)}` : ''}
                >
                  {day && (
                    <>
                      <span className="text-sm font-medium text-center">
                        {day.dayOfMonth}
                      </span>
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(day.status)}
                      </div>
                      {day.isExpectedDay && day.status === 'no-entry' && (
                        <div className="absolute top-0 left-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Gennemført</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>Ikke gennemført</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-500" />
              <span>Forventet men glemt</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Forventet dag</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusText(day: CalendarDay): string {
  switch (day.status) {
    case 'completed':
      return 'Gennemført';
    case 'missed':
      return day.reason ? `Ikke gennemført (${day.reason})` : 'Ikke gennemført';
    case 'expected-missed':
      return 'Forventet dag - ikke gennemført';
    default:
      return day.isExpectedDay ? 'Forventet dag - ingen registrering' : 'Ingen registrering';
  }
} 