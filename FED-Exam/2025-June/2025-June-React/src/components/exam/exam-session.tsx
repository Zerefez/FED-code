import { Card, CardContent } from '@/components/ui/card';
import { useExamContext, useExamSessionContext } from '@/contexts';
import { useStudents } from '@/hooks';
import { useEffect, useState } from 'react';
import {
  drawRandomQuestion,
  formatTime,
  getTimerColor,
  GradingCard,
  NotesCard,
  QuestionDrawingCard,
  QuestionResultCard,
  StartExamCard,
  StudentInfoCard,
  TimerControlsCard,
  TimeUpNotification,
  useExamTimer
} from './exam-session/index';

// Type definition for the different states an exam session can be in
// This ensures type safety and makes state transitions clear
type ExamState = 'waiting' | 'question-drawn' | 'in-progress' | 'finished';

// Main component that orchestrates the entire exam session workflow
// This component manages the complex state machine of conducting an oral exam
export function ExamSession() {
  // Get exam data and student management functions from context
  // This provides access to the current exam and list of students
  const { exam, uncompletedStudents, handleStudentUpdate } = useExamContext();
  
  // Get exam session state and navigation functions from context
  // This manages which student is currently being examined and flow control
  const { currentStudentIndex, handleNextStudent, handleExamComplete } = useExamSessionContext();
  
  // Get student update function from the students hook
  // This provides the API call to persist student data to the backend
  const { update: updateStudent } = useStudents();
  
  // Local state to track the current phase of the exam session
  // Starts in 'waiting' state where examiner can draw a question
  const [examState, setExamState] = useState<ExamState>('waiting');
  
  // State to store the randomly drawn question number
  // null when no question has been drawn yet
  const [drawnQuestion, setDrawnQuestion] = useState<number | null>(null);
  
  // State to store examiner's notes during the session
  // Starts empty and can be updated throughout the exam
  const [notes, setNotes] = useState('');
  
  // State to store the final grade given to the student
  // Empty until examiner assigns a grade at the end
  const [grade, setGrade] = useState('');
  
  // State to track if data is being submitted to prevent double submissions
  // Used to disable buttons and show loading states during API calls
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Early return with error message if no exam is available
  // This prevents the component from crashing if exam data isn't loaded
  if (!exam) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Ingen eksamen fundet</p>
        </CardContent>
      </Card>
    );
  }

  // Initialize the exam timer with the exam's duration
  // This provides countdown functionality and actual time tracking
  const {
    timeRemaining,      // How much time is left in the countdown
    actualExamTime,     // How much time has actually elapsed
    startTimer,         // Function to start the countdown
    stopTimer,          // Function to stop the countdown
    resetTimer          // Function to reset timer with new duration
  } = useExamTimer(exam.examDurationMinutes);

  // Get the current student being examined from the uncompleted students list
  const currentStudent = uncompletedStudents[currentStudentIndex];
  
  // Check if this is the last student in the exam session
  // Used to change UI text and determine if exam should be completed
  const isLastStudent = currentStudentIndex === uncompletedStudents.length - 1;

  // Safety check to ensure we have a valid current student
  // Prevents crashes if student index is out of bounds
  if (!currentStudent) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Ingen studerende fundet eller ugyldigt indeks</p>
        </CardContent>
      </Card>
    );
  }

  // Effect that runs when the current student changes
  // This resets all session state for the new student
  useEffect(() => {
    // Reset exam state to initial waiting phase
    setExamState('waiting');
    
    // Clear any previously drawn question
    setDrawnQuestion(null);
    
    // Reset timer to exam's original duration
    resetTimer(exam.examDurationMinutes);
    
    // Load existing notes for this student (if any)
    // Uses optional chaining and fallback to empty string
    setNotes(currentStudent?.notes || '');
    
    // Load existing grade for this student (if any)
    // Uses optional chaining and fallback to empty string
    setGrade(currentStudent?.grade || '');
  }, [currentStudentIndex]); // Only run when student index changes

  // Function to handle drawing a random question
  const handleDrawQuestion = () => {
    // Generate random question number between 1 and total questions
    const questionNumber = drawRandomQuestion(exam.numberOfQuestions);
    
    // Store the drawn question number in state
    setDrawnQuestion(questionNumber);
    
    // Move to the next phase where question is shown
    setExamState('question-drawn');
  };

  // Function to start the actual examination with timer
  const handleStartExamination = () => {
    // Move to in-progress phase where timer runs
    setExamState('in-progress');
    
    // Start the countdown timer
    startTimer();
  };

  // Function to stop the examination
  const handleStopExamination = () => {
    // Stop the countdown timer
    stopTimer();
    
    // Move to finished phase where grading can happen
    setExamState('finished');
  };

  // Function to submit the final grade and complete the student's exam
  const handleGradeSubmit = async () => {
    // Validate that a grade has been entered
    if (!grade.trim()) return;
    
    // Set submitting state to show loading UI and prevent double submission
    setIsSubmitting(true);
    
    try {
      // Update student record with all exam results
      // Preserves all existing student data and adds exam-specific fields
      const updatedStudent = await updateStudent(currentStudent.id, {
        ...currentStudent,                           // Spread existing student data
        questionNo: drawnQuestion!,                  // Store drawn question number
        examDurationMinutes: Math.ceil(actualExamTime / 60), // Convert seconds to minutes, round up
        notes: notes.trim(),                         // Store trimmed notes
        grade: grade.trim()                          // Store trimmed grade
      });
      
      // If update was successful, update local state
      if (updatedStudent) {
        // Update the student in the exam context
        handleStudentUpdate(updatedStudent);
        
        // Determine next action based on whether this is the last student
        if (isLastStudent) {
          // If last student, complete the entire exam
          handleExamComplete();
        } else {
          // If not last student, move to next student
          handleNextStudent(uncompletedStudents);
        }
      }
    } catch (error) {
      // Log error for debugging but don't crash the app
      // In production, this could show a user-friendly error message
      console.error('Fejl ved gemning af eksamen data:', error);
    } finally {
      // Always reset submitting state, even if there was an error
      setIsSubmitting(false);
    }
  };

  // Render the exam session interface with conditional components
  return (
    <div className="space-y-6">
      {/* Always show current student information at the top */}
      <StudentInfoCard
        student={currentStudent}                    // Current student data
        currentIndex={currentStudentIndex}         // Which student number (1-based)
        totalStudents={uncompletedStudents.length} // Total number of students
      />

      {/* Question drawing phase - only show when waiting for question */}
      {examState === 'waiting' && (
        <QuestionDrawingCard
          numberOfQuestions={exam.numberOfQuestions} // Total questions available
          onDrawQuestion={handleDrawQuestion}        // Function to draw random question
        />
      )}

      {/* Question result - show whenever a question has been drawn */}
      {drawnQuestion !== null && (
        <QuestionResultCard
          questionNumber={drawnQuestion} // Display the drawn question number
        />
      )}

      {/* Examination start phase - only show after question is drawn but before exam starts */}
      {examState === 'question-drawn' && (
        <StartExamCard
          examDurationMinutes={exam.examDurationMinutes} // Show exam duration
          onStartExamination={handleStartExamination}    // Function to start timer
        />
      )}

      {/* Timer and controls - show during and after examination */}
      {(examState === 'in-progress' || examState === 'finished') && (
        <TimerControlsCard
          timeRemaining={timeRemaining}              // Current countdown time
          actualExamTime={actualExamTime}            // Actual elapsed time
          examState={examState}                      // Current state for conditional rendering
          onStopExamination={handleStopExamination}  // Function to stop exam
          formatTime={formatTime}                    // Utility to format seconds as MM:SS
          getTimerColor={() => getTimerColor(timeRemaining)} // Function to get color based on time
        />
      )}

      {/* Notes section - show during and after examination */}
      {(examState === 'in-progress' || examState === 'finished') && (
        <NotesCard
          notes={notes}                  // Current notes text
          examState={examState}          // Current state for UI feedback
          onNotesChange={setNotes}       // Function to update notes
        />
      )}

      {/* Grading section - only show after examination is stopped */}
      {examState === 'finished' && (
        <GradingCard
          grade={grade}                    // Current grade value
          drawnQuestion={drawnQuestion}    // Question number for confirmation
          actualExamTime={actualExamTime}  // Actual time for record keeping
          notes={notes}                    // Notes for confirmation
          isLastStudent={isLastStudent}    // Whether this completes the exam
          isSubmitting={isSubmitting}      // Loading state for submit button
          onGradeChange={setGrade}         // Function to update grade
          onSubmit={handleGradeSubmit}     // Function to submit final grade
        />
      )}

      {/* Time up notification - only show when timer reaches zero during exam */}
      {timeRemaining === 0 && examState === 'in-progress' && (
        <TimeUpNotification 
          onStopExamination={handleStopExamination} // Allow stopping exam when time is up
        />
      )}
    </div>
  );
} 