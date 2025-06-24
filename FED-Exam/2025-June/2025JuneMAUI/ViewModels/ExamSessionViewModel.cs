using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using _2025JuneMAUI.Models;
using _2025JuneMAUI.Services;
using System.Collections.ObjectModel;

namespace _2025JuneMAUI.ViewModels
{
    // Exam session ViewModel managing the complete examination workflow
    // Handles student progression, question drawing, timing, and grade recording
    // Implements IDisposable to properly clean up timer event subscriptions
    public partial class ExamSessionViewModel : BaseViewModel, IDisposable
    {
        // Private readonly fields for dependency injection
        // Core services required for exam session management functionality
        private readonly IExamService _examService;              // Manages exam data and operations
        private readonly IExamSessionService _examSessionService; // Handles session-specific business logic
        private readonly ITimerService _timerService;            // Provides countdown and elapsed time tracking
        private readonly IDialogService _dialogService;          // User interaction for alerts and confirmations
        private readonly IDataService _dataService;              // Database operations for persistence

        // Private field to track the randomly drawn question number
        // Stored separately from UI display to maintain data integrity
        private int _drawnQuestionNumber;

        // Observable properties for data binding with XAML interface
        // Core data properties that drive the examination workflow
        [ObservableProperty] private Exam? selectedExam;          // Currently selected exam configuration
        [ObservableProperty] private Student? currentStudent;     // Student currently being examined

        // Index tracking and navigation properties
        [ObservableProperty] private int currentStudentIndex;     // Position in student list for navigation

        // UI display properties for information presentation
        // String properties that format and display examination state information
        [ObservableProperty] private string examInfo = string.Empty;           // Formatted exam details display
        [ObservableProperty] private string studentInfo = string.Empty;        // Current student identification
        [ObservableProperty] private string progressInfo = string.Empty;       // Progress through student list
        [ObservableProperty] private string drawnQuestionDisplay = string.Empty; // Question number presentation
        [ObservableProperty] private string timerDisplay = "00:00";            // Formatted timer display
        [ObservableProperty] private string timerColor = "Black";              // Timer color based on remaining time
        [ObservableProperty] private string timerStatus = "Tid tilbage";       // Timer status description
        [ObservableProperty] private string notes = string.Empty;              // Examiner notes for current student
        [ObservableProperty] private string grade = string.Empty;              // Assigned grade for current student
        [ObservableProperty] private string actualExaminationTime = string.Empty; // Final examination duration
        [ObservableProperty] private string studentSummaryInfo = string.Empty; // Completion summary display

        // Boolean properties controlling UI element visibility and enabled states
        // These properties create a state machine that controls the examination workflow
        [ObservableProperty] private bool isExamStarted;           // Whether exam session is active
        [ObservableProperty] private bool showExamSelection = true; // Show exam selection interface
        [ObservableProperty] private bool showExamInfo;            // Display exam information panel
        [ObservableProperty] private bool hasDrawnQuestion;        // Question has been randomly selected
        [ObservableProperty] private bool isTimerRunning;          // Countdown timer is active
        [ObservableProperty] private bool showDrawQuestionButton = true; // Enable question drawing
        [ObservableProperty] private bool showStartExaminationButton; // Enable examination start
        [ObservableProperty] private bool showEndExaminationButton;   // Enable examination end
        [ObservableProperty] private bool showDataEntry;             // Show grade and notes input
        [ObservableProperty] private bool showActualTime;            // Display final examination time
        [ObservableProperty] private bool showSaveButton;            // Enable save student data
        [ObservableProperty] private bool showStudentSummary;        // Display student completion summary
        [ObservableProperty] private bool showExamCompletionOverview; // Show exam completion statistics
        [ObservableProperty] private bool canEditNotes;              // Enable notes text input
        [ObservableProperty] private bool canEnterGrade;             // Enable grade selection

        // Constructor with dependency injection using tuple deconstruction
        // Initializes services, collections, and sets up timer event handling
        public ExamSessionViewModel(IExamService examService, IExamSessionService examSessionService, ITimerService timerService, IDialogService dialogService, IDataService dataService)
        {
            // Assign all injected dependencies using tuple deconstruction for concise initialization
            (_examService, _examSessionService, _timerService, _dialogService, _dataService) = 
                (examService, examSessionService, timerService, dialogService, dataService);
            
            // Set ViewModel title for navigation and display purposes
            Title = "Start Eksamen";
            
            // Initialize observable collections for data binding with XAML lists
            // Create collections for exams, students, and available grade options
            (Exams, Students, AvailableGrades) = (new(), new(), new(_examSessionService.GetAvailableGrades()));
            
            // Subscribe to timer tick events for real-time UI updates
            // Lambda expression ensures UI updates occur on main thread
            _timerService.TimerTick += OnTimerTick;
            
            // Start asynchronous loading of available exams
            // Fire-and-forget pattern for background initialization
            _ = LoadExams();
        }

        // Timer tick event handler for real-time countdown display updates
        // Ensures UI updates occur on main thread and handles automatic exam termination
        private void OnTimerTick(object? sender, int remainingSeconds) => MainThread.BeginInvokeOnMainThread(() =>
        {
            // Calculate total exam duration in seconds for color determination
            var totalDurationSeconds = (SelectedExam?.ExamDurationMinutes ?? 15) * 60;
            
            // Update timer display with formatted time string
            TimerDisplay = _examSessionService.FormatTime(remainingSeconds);
            
            // Update timer color based on remaining time percentage
            // Color changes provide visual feedback about time urgency
            TimerColor = _examSessionService.GetTimerColor(remainingSeconds, totalDurationSeconds);
            
            // Auto-end examination when countdown reaches zero
            // Only triggers during countdown mode when timer is actively running
            if (remainingSeconds <= 0 && _timerService.IsCountdownMode && IsTimerRunning) 
                EndExamination();
        });

        // Public observable collections for XAML data binding
        // Provide data sources for picker controls and list displays
        public ObservableCollection<Exam> Exams { get; }           // Available exams for selection
        public ObservableCollection<Student> Students { get; }     // Students registered for selected exam
        public ObservableCollection<string> AvailableGrades { get; } // Valid grade options for assignment

        // Partial method triggered when SelectedExam property changes
        // Updates exam information display and visibility based on valid selection
        partial void OnSelectedExamChanged(Exam? value) => 
            // Use null-conditional operator and ID validation to determine display state
            // Tuple assignment provides concise property updates
            (ExamInfo, ShowExamInfo) = value?.Id > 0 ? 
                ($"{value.CourseName} - {value.Date}", true) : 
                (string.Empty, false);

        // Partial method triggered when CurrentStudent property changes
        // Updates student information, progress tracking, and workflow state
        partial void OnCurrentStudentChanged(Student? value)
        {
            // Validate student exists and has valid database ID
            // ID > 0 indicates persisted entity versus new/invalid objects
            if (value?.Id > 0)
            {
                // Update student display information using tuple assignment
                // Combines student name, number, progress, and existing data
                (StudentInfo, ProgressInfo, Notes, Grade) = (
                    $"{value.FirstName} {value.LastName} ({value.StudentNo})",  // Student identification
                    Students?.Count > 0 ? $"Studerende {Math.Max(0, CurrentStudentIndex) + 1} af {Students.Count}" : "Ingen studerende", // Progress indicator
                    value.Notes ?? string.Empty,    // Existing notes or empty string
                    value.Grade ?? string.Empty);   // Existing grade or empty string
                
                // Check if student has already completed examination
                // Show completion summary if grade exists, otherwise reset workflow
                if (_examSessionService.IsStudentCompleted(value)) 
                    ShowCompletedStudent(); 
                else 
                    ResetWorkflow();
            }
            else 
            {
                // Clear all student-related display information for invalid/null student
                // Tuple assignment provides efficient multi-property reset
                (StudentInfo, ProgressInfo, Notes, Grade) = 
                    (string.Empty, string.Empty, string.Empty, string.Empty);
            }
        }

        // Relay command to asynchronously load all available exams
        // Uses ExecuteAsync wrapper for consistent error handling patterns
        [RelayCommand]
        private async Task LoadExams() => await ExecuteAsync(async () => 
            // Update Exams collection with data from exam service
            // UpdateCollectionFromList provides efficient collection synchronization
            UpdateCollectionFromList(Exams, await _examService.GetAllExamsAsync()), 
            showErrors: false); // Suppress error dialogs for background loading

        // Relay command to load students for specified exam ID
        // Conditional loading based on valid exam ID parameter
        [RelayCommand]
        private async Task LoadStudents(int examId) => await ExecuteAsync(async () => 
        {
            // Only load students if valid exam ID provided
            if (examId > 0) 
                UpdateCollectionFromList(Students, await _examSessionService.GetStudentsForExamAsync(examId));
            else
                Students.Clear(); // Clear collection for invalid exam ID
        }, showErrors: false);

        // Relay command to start examination session
        // Validates exam selection, loads students, and handles completion scenarios
        [RelayCommand]
        private async Task StartExam() => await ExecuteAsync(async () =>
        {
            // Validate exam selection before proceeding
            if (SelectedExam?.Id <= 0) 
            { 
                await _dialogService.ShowAlertAsync("Fejl", "Vælg eksamen først"); 
                return; 
            }
            
            // Store exam ID for consistent reference throughout method
            var examId = SelectedExam.Id;
            
            // Load students for selected exam
            await LoadStudents(examId);
            
            // Check if all students have completed examination
            var (total, completed, _) = await _examSessionService.GetExamProgressAsync(examId);
            if (completed == total && total > 0) 
            { 
                // Show completion overview if all students finished
                await ShowExamCompletion(examId, total, completed); 
                return; 
            }
            
            // Find first student who hasn't completed examination
            var firstStudent = await _examSessionService.FindFirstUncompletedStudentAsync(examId);
            if (firstStudent == null) 
            { 
                await _dialogService.ShowAlertAsync("Info", "Ingen studerende tilmeldt eksamen!"); 
                return; 
            }
            
            // Locate student index in current collection
            var studentIndex = Students.ToList().FindIndex(s => s.Id == firstStudent.Id);
            
            // Reload students if first uncompleted student not found in collection
            if (studentIndex == -1) 
            { 
                await LoadStudents(examId); 
                studentIndex = Students.ToList().FindIndex(s => s.Id == firstStudent.Id); 
            }
            
            // Insert student at beginning of collection if still not found
            if (studentIndex == -1) 
            { 
                Students.Insert(0, firstStudent); 
                studentIndex = 0; 
            }
            
            // Update examination state to active mode with first student
            // Tuple assignment efficiently updates multiple UI state properties
            (IsExamStarted, ShowExamSelection, ShowExamCompletionOverview, CurrentStudentIndex, CurrentStudent) = 
                (true, false, false, studentIndex, firstStudent);
            
            // Notify user of successful exam start with progress information
            await _dialogService.ShowAlertAsync("Eksamen startet", 
                $"Næste: {firstStudent.FirstName} {firstStudent.LastName}\nStatus: {completed}/{total} færdige");
        }, _dialogService); // Use dialog service for error display

        // Relay command to draw random question for current examination
        // Updates UI state to show drawn question and enable next workflow step
        [RelayCommand]
        private void DrawQuestion()
        {
            // Validate exam has questions configured before drawing
            if (SelectedExam?.NumberOfQuestions <= 0) return;
            
            // Generate random question number using session service
            _drawnQuestionNumber = _examSessionService.DrawRandomQuestion(SelectedExam.NumberOfQuestions);
            
            // Update UI state to reflect question drawing completion
            // Tuple assignment efficiently updates multiple related properties
            (DrawnQuestionDisplay, HasDrawnQuestion, ShowDrawQuestionButton, ShowStartExaminationButton) = 
                ($"Spørgsmål {_drawnQuestionNumber}", true, false, true);
        }

        // Relay command to start timed examination period
        // Configures countdown timer and updates UI for active examination state
        [RelayCommand]
        private void StartExamination()
        {
            // Validate exam duration is configured before starting timer
            if (SelectedExam?.ExamDurationMinutes <= 0) return;
            
            // Configure timer service for countdown mode with exam duration
            _timerService.SetCountdownDuration(SelectedExam.ExamDurationMinutes);
            
            // Initialize timer display with full duration
            TimerDisplay = _examSessionService.FormatTime(SelectedExam.ExamDurationMinutes * 60);
            TimerStatus = "Tid tilbage";
            
            // Start countdown timer
            _timerService.Start();
            
            // Update UI state for active examination period
            // Enable data entry, disable start button, show end button
            (IsTimerRunning, ShowStartExaminationButton, ShowEndExaminationButton, ShowDataEntry, CanEditNotes) = 
                (true, false, true, true, true);
            
            // Disable grade entry until examination ends
            CanEnterGrade = false;
            ShowSaveButton = false;
        }

        // Relay command to end examination and transition to grading
        // Stops timer, calculates duration, and enables grade entry
        [RelayCommand] 
        private void EndExamination() 
        { 
            // Stop countdown timer and capture elapsed time
            _timerService.Stop(); 
            
            // Get elapsed time for duration calculations and display
            var elapsedMinutes = _timerService.GetElapsedMinutes();
            var elapsedSeconds = _timerService.ElapsedSeconds;
            
            // Update timer display to show final elapsed time
            TimerDisplay = _examSessionService.FormatTime(elapsedSeconds);
            TimerColor = "#DC2626";  // Red color indicates examination ended
            TimerStatus = "Eksamen afsluttet";
            
            // Update UI state for post-examination data entry
            // Show actual time, enable grading, hide end button
            (ActualExaminationTime, ShowEndExaminationButton, ShowActualTime, CanEnterGrade, ShowSaveButton) = 
                ($"Faktisk eksaminationstid: {elapsedMinutes} min ({TimerDisplay})", false, true, true, true); 
            
            // Keep notes editable for final examiner comments
            CanEditNotes = true;
        }

        // Relay command to save student examination data
        // Validates required data and persists examination results
        [RelayCommand]
        private async Task SaveStudentData() => await ExecuteAsync(async () =>
        {
            // Validate current student and grade selection before saving
            if (CurrentStudent?.Id <= 0 || string.IsNullOrEmpty(Grade)) 
            { 
                await _dialogService.ShowAlertAsync("Fejl", "Vælg karakter"); 
                return; 
            }
            
            // Save examination data using session service
            if (CurrentStudent != null)
                await _examSessionService.SaveStudentExamDataAsync(
                    CurrentStudent, _drawnQuestionNumber, _timerService.GetElapsedMinutes(), Notes, Grade);
            
            // Update UI state to show completion summary
            // Disable data entry controls and show summary information
            (ShowSaveButton, ShowDataEntry, CanEditNotes, CanEnterGrade, ShowStudentSummary) = 
                (false, false, false, false, true);
            
            // Generate and display student completion summary
            if (CurrentStudent != null)
                StudentSummaryInfo = await _examSessionService.GetStudentSummaryAsync(CurrentStudent);
        }, _dialogService); // Show errors via dialog service

        // Relay command to navigate to next student in examination sequence
        // Handles completion checking and exam completion scenarios
        [RelayCommand]
        private async Task NextStudent() => await ExecuteAsync(async () =>
        {
            // Validate exam selection before proceeding
            if (SelectedExam?.Id <= 0) return;
            
            var examId = SelectedExam.Id;
            
            // Attempt to get next student in sequence
            var nextStudent = await _examSessionService.GetCurrentStudentAsync(examId, CurrentStudentIndex + 1);
            
            // Check if next student exists and hasn't completed examination
            if (nextStudent != null && !_examSessionService.IsStudentCompleted(nextStudent)) 
            {
                // Move to next student in sequence
                (CurrentStudent, CurrentStudentIndex) = (nextStudent, CurrentStudentIndex + 1);
            }
            // Search for any uncompleted students if linear progression fails
            else if (await _examSessionService.HasUncompletedStudentsAsync(examId)) 
            { 
                var uncompleted = await _examSessionService.FindFirstUncompletedStudentAsync(examId); 
                if (uncompleted != null) CurrentStudent = uncompleted; 
            }
            // Handle exam completion scenario
            else 
            { 
                // Get final statistics and show completion overview
                var (total, completed, _) = await _examSessionService.GetExamProgressAsync(examId); 
                await ShowExamCompletion(examId, total, completed); 
                
                // Update UI state to show completion and return to selection
                (ShowExamCompletionOverview, ShowStudentSummary, IsExamStarted, ShowExamSelection) = 
                    (true, false, false, true); 
            }
        }, showErrors: false); // Background navigation without error popups

        // Relay command to return to exam selection interface
        // Resets all examination state and stops any running timers
        [RelayCommand]
        private void BackToSelection()
        {
            // Safely stop and reset timer service
            // Try-catch handles potential disposal issues
            try { _timerService.Stop(); _timerService.Reset(); } catch { }
            
            // Reset UI state to initial exam selection mode
            (ShowExamSelection, ShowExamInfo, IsExamStarted, ShowExamCompletionOverview, ShowStudentSummary) = 
                (true, false, false, false, false);
            
            // Clear selected exam and student references
            (SelectedExam, CurrentStudent, CurrentStudentIndex) = (null, null, 0);
            
            // Reset examination workflow to initial state
            ResetWorkflow();
        }

        // Private method to reset examination workflow to initial state
        // Clears all UI state properties and stops timer services
        private void ResetWorkflow()
        {
            // Reset workflow state flags to initial values
            (HasDrawnQuestion, ShowDrawQuestionButton, ShowStartExaminationButton, ShowEndExaminationButton) = 
                (false, true, false, false);
            
            // Reset UI visibility and interaction flags
            (ShowDataEntry, ShowActualTime, CanEditNotes, CanEnterGrade, ShowSaveButton, ShowStudentSummary, ShowExamCompletionOverview) = 
                (false, false, false, false, false, false, false);
            
            // Clear all display strings to empty state
            (DrawnQuestionDisplay, TimerDisplay, TimerColor, TimerStatus, ActualExaminationTime, StudentSummaryInfo, IsTimerRunning) = 
                (string.Empty, "00:00", "Black", "Tid tilbage", string.Empty, string.Empty, false);
            
            // Reset timer service to clean state
            try { _timerService.Reset(); } catch { }
        }

        // Private method to display completed student information
        // Shows summary for students who have already finished examination
        private void ShowCompletedStudent()
        {
            // Reset workflow to clean state
            ResetWorkflow();
            
            // Create and display completion summary information
            // Tuple assignment efficiently updates summary display properties
            (StudentSummaryInfo, ShowStudentSummary) = (
                $"✅ EKSAMEN ALLEREDE GENNEMFØRT\n\n{CurrentStudent?.FirstName} {CurrentStudent?.LastName}\nStudienummer: {CurrentStudent?.StudentNo}\nSpørgsmål: {CurrentStudent?.QuestionNo}\nKarakter: {CurrentStudent?.Grade}", 
                true);
        }

        // Private method to display exam completion statistics
        // Shows comprehensive completion summary with grade average
        private async Task ShowExamCompletion(int examId, int total, int completed)
        {
            // Calculate grade average for completed exam
            var average = await _dataService.GetExamAverageGradeAsync(examId);
            
            // Update UI state to show completion overview
            // Format comprehensive completion message with statistics
            (StudentSummaryInfo, ShowExamCompletionOverview, IsExamStarted, ShowExamSelection) = (
                $"🎉 EKSAMEN AFSLUTTET\n\nAlle {total} studerende har gennemført eksamen.\n\n📊 Status: {completed}/{total} færdige\n📈 Gennemsnit: {average:F1}", 
                true, false, false);
        }

        // Dispose method to properly clean up timer event subscriptions
        // Prevents memory leaks from event handler references
        public void Dispose() => _timerService.TimerTick -= OnTimerTick;
    }
}