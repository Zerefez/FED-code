import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Props interface defining what this component needs from parent
// This ensures type safety and clear data flow
interface QuestionDrawingCardProps {
  numberOfQuestions: number;          // Total questions available for this exam
  onDrawQuestion: () => void;         // Function to trigger random question selection
}

// Component for the initial step of drawing a random question
// This starts the formal examination process with fair question distribution
export function QuestionDrawingCard({ numberOfQuestions, onDrawQuestion }: QuestionDrawingCardProps) {
  return (
    <Card>
      <CardHeader>
        {/* Step indicator showing this is the first action */}
        <CardTitle>Trin 1: Træk spørgsmål</CardTitle>
        
        {/* Clear instructions for the examiner */}
        {/* Show the range of available questions for transparency */}
        <CardDescription>
          Klik for at trække et tilfældigt spørgsmål mellem 1 og {numberOfQuestions}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Large, prominent button to draw question */}
        <Button 
          onClick={onDrawQuestion}    // Trigger the random question selection
          size="lg"                   // Large size for prominence and easy clicking
          className="w-full"          // Full width for better accessibility
        >
          Træk spørgsmål
        </Button>
      </CardContent>
    </Card>
  );
} 