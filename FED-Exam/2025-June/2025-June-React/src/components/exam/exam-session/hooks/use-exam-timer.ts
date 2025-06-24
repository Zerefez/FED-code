import { useEffect, useRef, useState } from 'react';

// Interface defining the return type of the custom hook for type safety
// This ensures consumers know exactly what properties and methods are available
interface UseExamTimerReturn {
  timeRemaining: number;      // Countdown timer in seconds
  actualExamTime: number;     // Actual elapsed time in seconds
  isRunning: boolean;         // Whether timer is currently active
  startTimer: () => void;     // Function to start the countdown
  stopTimer: () => void;      // Function to stop the countdown
  resetTimer: (durationMinutes: number) => void; // Function to reset timer with new duration
}

// Custom hook that encapsulates all timer-related logic for exam sessions
// Takes initial duration in minutes and returns timer state and control functions
export function useExamTimer(initialDurationMinutes: number): UseExamTimerReturn {
  // State for countdown timer - starts at initial duration converted to seconds
  // This tracks how much time is left for the exam
  const [timeRemaining, setTimeRemaining] = useState(initialDurationMinutes * 60);
  
  // State for actual elapsed time - starts at 0
  // This tracks how much time has actually passed since timer started
  const [actualExamTime, setActualExamTime] = useState(0);
  
  // State to track if timer is currently running
  // Used to prevent multiple timers and show proper UI state
  const [isRunning, setIsRunning] = useState(false);
  
  // Ref to store the interval ID for cleanup purposes
  // useRef is used because we need the value to persist across renders
  // and we don't want changes to trigger re-renders
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to play audio notification using Web Audio API
  // This provides audible feedback when timer reaches certain milestones
  const playTimerSound = () => {
    try {
      // Create audio context - works across different browsers
      // webkitAudioContext is for Safari compatibility
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillator to generate sound wave
      const oscillator = audioContext.createOscillator();
      
      // Create gain node to control volume
      const gainNode = audioContext.createGain();
      
      // Connect audio nodes: oscillator -> gain -> speakers
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency to 800Hz for a clear, audible tone
      oscillator.frequency.value = 800;
      
      // Use sine wave for a pure, clean sound
      oscillator.type = 'sine';
      
      // Set volume to 30% to avoid being too loud
      gainNode.gain.value = 0.3;
      
      // Start playing the sound immediately
      oscillator.start();
      
      // Stop the sound after 0.5 seconds to create a beep
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Gracefully handle audio failures without breaking the app
      // Audio might fail in some browsers or when permissions are denied
      console.warn('Could not play audio:', error);
    }
  };

  // Function to start the countdown timer
  const startTimer = () => {
    // Prevent starting multiple timers by checking if one already exists
    if (timerIntervalRef.current) return;
    
    // Set running state to true for UI feedback
    setIsRunning(true);
    
    // Reset actual exam time when starting
    setActualExamTime(0);
    
    // Create interval that runs every 1000ms (1 second)
    const interval = setInterval(() => {
      // Update time remaining using function form of setState
      // This ensures we get the most current value even with rapid updates
      setTimeRemaining(prev => {
        // Calculate new time by subtracting 1 second
        const newTime = prev - 1;
        
        // Also increment actual exam time
        // This tracks total time regardless of the countdown
        setActualExamTime(prevActual => prevActual + 1);
        
        // If time reaches zero, play sound and stop countdown
        if (newTime <= 0) {
          playTimerSound();
          return 0; // Don't go below zero
        }
        
        // Play warning sound when 1 minute remaining
        // This gives examiner warning that time is almost up
        if (newTime === 60) {
          playTimerSound();
        }
        
        // Return the new time value
        return newTime;
      });
    }, 1000); // Run every 1000 milliseconds
    
    // Store interval reference for later cleanup
    timerIntervalRef.current = interval;
  };

  // Function to stop the timer
  const stopTimer = () => {
    // Check if timer exists before trying to clear it
    if (timerIntervalRef.current) {
      // Clear the interval to stop the countdown
      clearInterval(timerIntervalRef.current);
      
      // Reset the reference to null
      timerIntervalRef.current = null;
    }
    
    // Set running state to false
    setIsRunning(false);
    
    // Play sound to indicate timer has stopped
    playTimerSound();
  };

  // Function to reset timer with a new duration
  const resetTimer = (durationMinutes: number) => {
    // Stop any existing timer first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Reset time remaining to new duration (converted to seconds)
    setTimeRemaining(durationMinutes * 60);
    
    // Reset actual exam time to zero
    setActualExamTime(0);
    
    // Set running state to false
    setIsRunning(false);
  };

  // Cleanup effect that runs when component unmounts
  // This prevents memory leaks by clearing any active intervals
  useEffect(() => {
    // Return cleanup function that will run on unmount
    return () => {
      // Clear interval if it exists when component unmounts
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

  // Return all timer state and control functions
  // This provides a clean API for components to use the timer
  return {
    timeRemaining,    // Current countdown value
    actualExamTime,   // Total elapsed time
    isRunning,        // Whether timer is active
    startTimer,       // Function to start countdown
    stopTimer,        // Function to stop countdown
    resetTimer,       // Function to reset with new duration
  };
} 