import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Square, Timer } from 'lucide-react';

// Props interface defining all the data and functions this component needs
// This creates a comprehensive contract for timer control functionality
interface TimerControlsCardProps {
  timeRemaining: number;                            // Countdown time in seconds
  actualExamTime: number;                           // Actual elapsed time in seconds
  examState: 'in-progress' | 'finished';           // Current exam state for conditional rendering
  onStopExamination: () => void;                    // Function to stop the examination
  formatTime: (seconds: number) => string;         // Utility function to format time display
  getTimerColor: () => string;                      // Function to get color based on time remaining
}

// Component that displays timer information and provides exam control
// This is the central control panel during active examination
export function TimerControlsCard({
  timeRemaining,
  actualExamTime,
  examState,
  onStopExamination,
  formatTime,
  getTimerColor
}: TimerControlsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* Timer icon provides visual context */}
          <Timer className="h-5 w-5" />
          Eksaminationstimer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Central timer display area */}
        <div className="text-center">
          {/* Large countdown display with dynamic color */}
          {/* Color changes based on remaining time (red when critical) */}
          <div className={`text-4xl font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Label for countdown timer */}
          <p className="text-sm text-muted-foreground">Tid tilbage</p>
          
          {/* Additional info showing actual elapsed time */}
          {/* This helps track real exam duration vs. allocated time */}
          <p className="text-sm text-muted-foreground">
            Faktisk eksaminationstid: {formatTime(actualExamTime)}
          </p>
        </div>
        
        {/* Control button - only show during active examination */}
        {examState === 'in-progress' && (
          <Button 
            onClick={onStopExamination}       // Stop the examination manually
            size="lg"                         // Large size for important action
            className="w-full gap-2"          // Full width with icon spacing
            variant="destructive"             // Red variant indicates stopping action
          >
            {/* Square icon represents "stop" action */}
            <Square className="h-4 w-4" />
            Slut eksamination
          </Button>
        )}

        {/* Status display when examination is finished */}
        {examState === 'finished' && (
          <div className="text-center p-4 bg-green-50 rounded-md border border-green-200">
            {/* Confirmation message */}
            <p className="text-green-700 font-medium">Eksaminationen er afsluttet</p>
            
            {/* Final time summary */}
            <p className="text-sm text-green-600">Faktisk tid brugt: {formatTime(actualExamTime)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 