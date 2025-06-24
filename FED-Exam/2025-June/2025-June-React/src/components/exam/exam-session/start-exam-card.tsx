import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';

// Props interface defining what this component needs from parent
// This ensures type safety and clear component requirements
interface StartExamCardProps {
  examDurationMinutes: number;        // Duration of the exam to display to examiner
  onStartExamination: () => void;     // Function to trigger the exam timer start
}

// Component for initiating the timed examination phase
// This represents the transition from preparation to active examination
export function StartExamCard({ examDurationMinutes, onStartExamination }: StartExamCardProps) {
  return (
    <Card>
      <CardHeader>
        {/* Step indicator showing this is the second phase */}
        <CardTitle>Trin 2: Start eksamination</CardTitle>
        
        {/* Clear information about what will happen */}
        {/* Emphasize that timer will start counting down */}
        <CardDescription>
          Eksaminationstid: {examDurationMinutes} minutter. Timeren starter nedtælling.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Prominent button to start the timed examination */}
        <Button 
          onClick={onStartExamination}    // Trigger timer start and state change
          size="lg"                       // Large size for important action
          className="w-full gap-2"        // Full width with icon spacing
        >
          {/* Play icon suggests starting/beginning */}
          <Play className="h-4 w-4" />
          Start eksamination
        </Button>
      </CardContent>
    </Card>
  );
} 