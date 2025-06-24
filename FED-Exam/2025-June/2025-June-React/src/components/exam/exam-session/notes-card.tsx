import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Props interface defining what data and functions this component needs
// This ensures type safety and clear communication about component requirements
interface NotesCardProps {
  notes: string;                                    // Current notes text content
  examState: 'in-progress' | 'finished';          // Current state of the exam to adjust UI
  onNotesChange: (notes: string) => void;         // Callback function to update notes in parent component
}

// Component for capturing and displaying examiner notes during and after the exam
// This provides a persistent text area for recording observations and feedback
export function NotesCard({ notes, examState, onNotesChange }: NotesCardProps) {
  return (
    <Card>
      <CardHeader>
        {/* Dynamic title that adapts to exam state */}
        <CardTitle>Trin 3: Noter til eksaminationen</CardTitle>
        
        {/* Dynamic description that provides context-appropriate guidance */}
        <CardDescription>
          {/* Show different instructions based on whether exam is active or finished */}
          {examState === 'in-progress' 
            ? 'Indtast noter mens eksaminationen foregår'     // Active exam - encourage real-time notes
            : 'Rediger noter eller tilføj yderligere kommentarer'}  // Finished exam - allow editing
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Textarea for multi-line note input */}
        <textarea
          // Styling classes for consistent appearance and behavior
          className="w-full min-h-32 p-3 border rounded-md resize-y"
          
          // Placeholder text to guide user input
          placeholder="Indtast noter her..."
          
          // Controlled component - value comes from props
          value={notes}
          
          // Handle changes by calling parent's update function
          // e.target.value gets the current text content
          onChange={(e) => onNotesChange(e.target.value)}
          
          // Notes are always editable during and after exam for flexibility
          // This allows examiners to make corrections or add details later
          disabled={false} // Always allow note editing during and after exam
        />
      </CardContent>
    </Card>
  );
} 