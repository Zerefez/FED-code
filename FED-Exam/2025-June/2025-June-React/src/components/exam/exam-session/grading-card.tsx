import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Props interface defining all the data and functions this component needs
// This creates a clear contract for what data flows into this component
interface GradingCardProps {
  grade: string;                              // Current grade value (controlled input)
  drawnQuestion: number | null;               // Question number that was drawn for this student
  actualExamTime: number;                     // Actual time spent in seconds
  notes: string;                              // Examiner's notes for this student
  isLastStudent: boolean;                     // Whether this is the final student in the exam
  isSubmitting: boolean;                      // Whether submission is in progress (for loading states)
  onGradeChange: (grade: string) => void;     // Function to update grade value
  onSubmit: () => void;                       // Function to submit final grade and complete
}

// Danish grading scale options for quick selection
// These represent the official Danish 7-point grading scale
const gradeOptions = ['12', '10', '7', '4', '02', '00', '-3'];

// Component for final grade assignment and exam completion
// This is the last step in the exam process where all data is finalized
export function GradingCard({
  grade,
  drawnQuestion,
  actualExamTime,
  notes,
  isLastStudent,
  isSubmitting,
  onGradeChange,
  onSubmit
}: GradingCardProps) {
  return (
    <Card>
      <CardHeader>
        {/* Step indicator shows this is the final phase */}
        <CardTitle>Trin 4: Indtast karakter</CardTitle>
        
        {/* Explain the finality of this action */}
        <CardDescription>
          Vælg eller indtast den studerendes karakter. Dette vil gemme alle data.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          {/* Label for accessibility and clarity */}
          <Label htmlFor="grade">Karakter</Label>
          
          {/* Quick-select buttons for common Danish grades */}
          <div className="flex gap-2 flex-wrap mt-2">
            {gradeOptions.map((gradeOption) => (
              <Button
                key={gradeOption}                                    // React key for list rendering
                type="button"                                        // Prevent form submission
                variant={grade === gradeOption ? "default" : "outline"} // Highlight selected grade
                size="sm"                                            // Compact size for grade buttons
                onClick={() => onGradeChange(gradeOption)}           // Set grade when clicked
              >
                {gradeOption}
              </Button>
            ))}
          </div>
          
          {/* Manual input field for custom grades or confirmation */}
          <div className="mt-2">
            <Input
              id="grade"                                    // Links to label for accessibility
              type="text"                                   // Text input for flexibility
              placeholder="Eller indtast karakter"         // Guide for manual entry
              value={grade}                                 // Controlled component value
              onChange={(e) => onGradeChange(e.target.value)} // Update on typing
            />
          </div>
        </div>

        {/* Summary panel showing all data that will be saved */}
        {/* This provides transparency and allows final verification */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Data der gemmes:</h4>
          
          {/* List of all exam data being recorded */}
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Spørgsmål nummer: {drawnQuestion}</li>
            <li>• Faktisk eksaminationstid: {Math.ceil(actualExamTime / 60)} minutter</li>
            <li>• Noter: {notes.trim() || 'Ingen noter'}</li>
            <li>• Karakter: {grade || 'Ikke angivet'}</li>
          </ul>
        </div>

        {/* Final submission button */}
        <div className="flex gap-4">
          <Button 
            onClick={onSubmit}                               // Trigger submission
            disabled={!grade.trim() || isSubmitting}        // Require grade and prevent double-submission
            className="flex-1"                               // Full width for prominence
          >
            {/* Dynamic button text based on loading state and student position */}
            {isSubmitting 
              ? 'Gemmer...'                                  // Loading state
              : (isLastStudent 
                  ? 'Afslut eksamen'                         // Last student - complete exam
                  : 'Næste studerende')}                     // More students - continue to next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 