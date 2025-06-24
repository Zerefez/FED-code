import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Square } from 'lucide-react';

// Props interface defining what this component needs
// Simple interface since this is primarily a notification component
interface TimeUpNotificationProps {
  onStopExamination: () => void;    // Function to allow immediate exam termination
}

// Component that appears when the allocated exam time has expired
// This provides urgent notification and allows graceful exam conclusion
export function TimeUpNotification({ onStopExamination }: TimeUpNotificationProps) {
  return (
    // Red theme indicates urgency and time expiration
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        {/* Center-aligned layout for maximum attention */}
        <div className="text-center">
          {/* Large clock icon reinforces time concept */}
          <Clock className="h-12 w-12 mx-auto text-red-500 mb-2" />
          
          {/* Urgent but clear headline */}
          <h3 className="text-lg font-semibold text-red-700">Tiden er udløbet!</h3>
          
          {/* Explanation that gives examiner flexibility */}
          {/* Acknowledges that exam can continue if needed */}
          <p className="text-red-600 mb-4">
            Den tildelte eksaminationstid er brugt. Du kan stadig fortsætte eller stoppe eksaminationen.
          </p>
          
          {/* Action button to end examination immediately */}
          <Button 
            onClick={onStopExamination}    // End the exam when clicked
            variant="destructive"          // Red variant reinforces urgency
            className="gap-2"              // Space for icon
          >
            {/* Square icon represents "stop" action */}
            <Square className="h-4 w-4" />
            Slut eksamination nu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 