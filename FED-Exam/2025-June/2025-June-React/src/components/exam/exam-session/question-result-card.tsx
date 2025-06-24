import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Props interface defining what data this component needs
// Simple interface since this component only displays the result
interface QuestionResultCardProps {
  questionNumber: number;     // The randomly drawn question number to display
}

// Component that displays the result of the random question drawing
// This provides clear, prominent display of the selected question
export function QuestionResultCard({ questionNumber }: QuestionResultCardProps) {
  return (
    // Special styling to indicate successful completion
    // Green theme suggests positive action completion
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        {/* Checkmark and green color indicate successful question drawing */}
        <CardTitle className="text-green-800">✓ Trukket spørgsmål</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Centered layout for maximum visual impact */}
        <div className="text-center">
          {/* Large, prominent display of the question number */}
          {/* Very large font size makes the number unmistakable */}
          <div className="text-6xl font-bold text-green-600 mb-2">{questionNumber}</div>
          
          {/* Descriptive label for clarity */}
          <p className="text-green-700 font-medium">Spørgsmål nummer</p>
        </div>
      </CardContent>
    </Card>
  );
} 