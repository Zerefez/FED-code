# Eksamen Administrationssystem - .NET MAUI Applikation

## Teknisk Arkitektur Dokumentation

### Indholdsfortegnelse
1. [.NET MAUI Arkitektur Oversigt](#net-maui-arkitektur-oversigt)
2. [Krydsplatform Udviklingsstrategi](#krydsplatform-udviklingsstrategi)
3. [MVVM Mønster Implementation](#mvvm-mønster-implementation)
4. [Dependency Injection og Service Arkitektur](#dependency-injection-og-service-arkitektur)
5. [Data Lag og Persistering](#data-lag-og-persistering)
6. [UI Arkitektur med XAML](#ui-arkitektur-med-xaml)
7. [Applikationsstruktur og Ansvarsadskillelse](#applikationsstruktur-og-ansvarsadskillelse)
8. [Performance Overvejelser](#performance-overvejelser)
9. [Designbeslutninger og Afvejninger](#designbeslutninger-og-afvejninger)

---

## .NET MAUI Arkitektur Oversigt

### Hvad er .NET MAUI og Hvorfor Bruge Det

.NET Multi-platform App UI (MAUI) repræsenterer Microsofts evolution af krydsplatform udvikling, der forener Xamarin.Forms, Xamarin.Android, Xamarin.iOS og WPF i et enkelt framework. Dette eksamen administrationssystem udnytter MAUIs fundamentale arkitektur til at levere native performance på tværs af Windows, Android, iOS og macOS platforme fra en enkelt kodebase.

Arkitekturfundamentet for MAUI hviler på flere nøgleprincipper, der direkte påvirker vores applikationsdesign:

**Enkelt Projekt Arkitektur**: I modsætning til traditionelle Xamarin applikationer, der krævede separate platform-specifikke projekter, bruger vores MAUI applikation en samlet projektstruktur som set i `2025JuneMAUI.csproj`. Denne konfiguration demonstrerer MAUIs konsolideringsmetode:

```xml
<TargetFrameworks>net9.0-android;net9.0-ios;net9.0-maccatalyst</TargetFrameworks>
<TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net9.0-windows10.0.19041.0</TargetFrameworks>
```

Denne multi-targeting tilgang tillader den samme kodebase at kompilere til forskellige platforme mens den bibeholder platform-specifikke optimeringer. Den betingede kompilering sikrer, at Windows-specifikke funktioner kun inkluderes når der bygges til Windows, hvilket demonstrerer MAUIs intelligente platform targeting.

**Native Performance Gennem Platform Abstraktioner**: MAUI opnår native performance ved at tilbyde platform abstraktioner, der kompilerer til native kontrolelementer. Vores applikations UI elementer, defineret i XAML filer som `MainPage.xaml`, oversættes automatisk til platform-specifikke kontrolelementer (WinUI for Windows, UIKit for iOS, osv.) ved kompileringstid, hvilket sikrer optimal brugeroplevelse på hver platform.

**Handler Arkitektur**: MAUI anvender en handler-baseret arkitektur, hvor hvert UI element har tilsvarende platform-specifikke handlers. Dette er transparent for vores applikationskode, men afgørende for at forstå hvorfor vores enkle XAML definition i `AppShell.xaml` kan rendere passende på tværs af forskellige platforme:

```xml
<TabBar>
    <ShellContent Title="Hjem" ContentTemplate="{DataTemplate local:MainPage}" Route="MainPage" />
    <ShellContent Title="Opret Eksamen" ContentTemplate="{DataTemplate views:ExamPage}" Route="ExamPage" />
</TabBar>
```

TabBar elementet her vil rendere som en TabView på Windows, UITabBarController på iOS og BottomNavigationView på Android, alt fra denne enkle definition.

## Krydsplatform Udviklingsstrategi

### Platform Abstraktion og Kodedeling

Vores eksamen administrationssystem opnår cirka 95% kodedeling på tværs af platforme gennem strategiske arkitekturbeslutninger. Krydsplatform strategien opererer på flere niveauer:

**Forretningslogik Abstraktion**: Kerneksamenlogikken, studerende administration og karakterberegnelser er fuldstændig platform-agnostiske. Klasser som `ExamSessionService` og `GradeCalculationService` indeholder ren C# logik, der eksekverer identisk på tværs af alle platforme:

```csharp
public int DrawRandomQuestion(int maxQuestions) => _random.Next(1, maxQuestions + 1);

public string GetTimerColor(int remainingSeconds, int totalDurationSeconds)
{
    var ratio = (double)remainingSeconds / totalDurationSeconds;
    return ratio switch
    {
        > 0.5 => "#22C55E", // Grøn
        > 0.25 => "#F59E0B", // Orange  
        _ => "#DC2626" // Rød
    };
}
```

Denne forretningslogik opererer uafhængigt af platform-specifikke UI frameworks, hvilket muliggør konsistent adfærd på tværs af alle målplatforme.

**Data Lag Universalitet**: Vores SQLite-baserede data persistering strategi udnytter `sqlite-net-pcl`, et portable class library der tilbyder identisk database funktionalitet på tværs af platforme. `Database.cs` implementeringen demonstrerer denne tilgang:

```csharp
public Database()
{
    var dataDir = FileSystem.AppDataDirectory;
    var databasePath = Path.Combine(dataDir, "ExamManagement.db");
    var dbOptions = new SQLiteConnectionString(databasePath, true);
    _connection = new SQLiteAsyncConnection(dbOptions);
}
```

`FileSystem.AppDataDirectory` oversættes automatisk til platform-passende lagerplaceringer (Dokumenter på iOS, intern storage på Android, AppData på Windows) mens den bibeholder en samlet API for vores applikationslogik.

### Runtime Platform Detektion og Tilpasning

Vores applikation anvender runtime platform detektion for funktioner, der kræver platform-specifik adfærd, mens den bibeholder arkitekturkonsistens. MAUI frameworket tilbyder implicit platform detektion gennem betinget kompilering og runtime APIer, hvilket tillader vores delte kodebase at tilpasse sig platform begrænsninger og kapaciteter uden eksplicitte platform tjek i forretningslogikken.

Krydsplatform strategiens effektivitet bevises af vores rene ansvarsadskillelse: forretningslogik forbliver platform-agnostisk mens platform-specifikke tilpasninger sker på framework niveauet, hvilket sikrer vedligeholdelse og konsistent funktionsparitet på tværs af alle understøttede platforme.

## MVVM Mønster Implementation

### Arkitekturfilosofi og Begrundelse

Model-View-ViewModel (MVVM) mønsteret danner den arkitektoniske rygrad i vores eksamen administrationssystem og tilbyder klar ansvarsadskillelse mellem præsentationslogik, forretningslogik og datamodeller. Dette mønstervalg er særligt strategisk for MAUI applikationer, fordi det harmonerer perfekt med XAMLs data binding kapaciteter og muliggør omfattende unit testing af forretningslogik uden UI afhængigheder.

Vores MVVM implementation udnytter CommunityToolkit.Mvvm biblioteket, som tilbyder moderne, kildegenererede implementeringer af almindelige MVVM mønstre. Dette valg eliminerer boilerplate kode mens det bibeholder performance gennem kompileringstids kodegenerering frem for runtime reflection.

### Model Lag: Data Repræsentation og Forretningsregler

Model laget i vores applikation omfatter både datamodeller og forretningsregel validering. Vores datamodeller, placeret i `Models` mappen, repræsenterer kernens forretningsentiteter med klare, fokuserede ansvarsområder:

```csharp
[Table("Students")]
public class Student
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }
    
    public int ExamId { get; set; } // Foreign key til Exam
    public string StudentNo { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int QuestionNo { get; set; }
    public int ExamDurationMinutes { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public int ExaminationOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
```

Dette modeldesign demonstrerer flere vigtige arkitekturbeslutninger. SQLite attributterne direkte på modelklasserne skaber en direkte mapping mellem objekt-relationel data uden at kræve separate data transfer objekter. Denne tilgang reducerer kompleksitet mens den bibeholder klare datakontrakter. Foreign key forholdet (`ExamId`) etablerer referentiel integritet på model niveau, hvilket sikrer datakonsistens på tværs af applikationen.

Forretningsreglerne er indkapslet i statiske service klasser som `GradeCalculationService`, der opererer på samlinger af disse modeller:

```csharp
public static string CalculateAverageGrade(IEnumerable<Student> students)
{
    var validGrades = students
        .Where(s => !string.IsNullOrEmpty(s.Grade) && GradeValues.ContainsKey(s.Grade))
        .Select(s => GradeValues[s.Grade])
        .ToList();
    
    if (!validGrades.Any()) return "N/A";
    
    var average = validGrades.Average();
    return GradeValues.OrderBy(kvp => Math.Abs(kvp.Value - average)).First().Key;
}
```

Denne adskillelse sikrer, at forretningslogik forbliver testbar og genanvendelig på tværs af forskellige kontekster inden for applikationen.

### ViewModel Lag: Præsentationslogik og Tilstandshåndtering

Vores ViewModel lag implementerer sofistikeret tilstandshåndtering ved hjælp af kildegenererede observable properties og kommandoer. Baseklassen `BaseViewModel` etablerer almindelige mønstre brugt gennem hele applikationen:

```csharp
public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool isBusy;
    
    [ObservableProperty]
    private string title = string.Empty;
    
    protected virtual async Task ExecuteAsync(Func<Task> operation, IDialogService? dialogService = null, bool showErrors = true)
    {
        if (IsBusy) return;
        IsBusy = true;
        try
        {
            await operation();
        }
        catch (Exception ex) when (showErrors && dialogService != null)
        {
            await dialogService.ShowAlertAsync("Fejl", ex.Message);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
```

`[ObservableProperty]` attributten genererer den nødvendige `INotifyPropertyChanged` implementation ved kompileringstid, hvilket eliminerer boilerplate mens det bibeholder optimal performance. `ExecuteAsync` metoden tilbyder et konsistent mønster for håndtering af asynkrone operationer med ordentlig fejlhåndtering og loading tilstandshåndtering.

### Kommando Mønster Implementation

Vores ViewModels bruger omfattende kommandomønsteret gennem `[RelayCommand]` attributter, som genererer `ICommand` implementeringer med ordentlig async support og parameter validering:

```csharp
[RelayCommand]
private async Task StartExam() => await ExecuteAsync(async () =>
{
    if (SelectedExam?.Id <= 0) 
    { 
        await _dialogService.ShowAlertAsync("Fejl", "Vælg eksamen først"); 
        return; 
    }
    
    var examId = SelectedExam.Id;
    await LoadStudents(examId);
    
    var (total, completed, _) = await _examSessionService.GetExamProgressAsync(examId);
    if (completed == total && total > 0) 
    { 
        await ShowExamCompletion(examId, total, completed); 
        return; 
    }
    
    // Fortsæt med eksamen initialisering...
}, _dialogService);
```

Denne kommando implementation demonstrerer flere nøglemønstre: input validering, asynkron operationshåndtering, service integration og ordentlig fejlhåndtering.

## Dependency Injection og Service Arkitektur

### Arkitekturfundament og Designfilosofi

Vores applikation anvender en omfattende dependency injection (DI) strategi, der fremmer løs kobling, testbarhed og vedligeholdelse. DI containeren, konfigureret i `MauiProgram.cs`, etablerer en service-orienteret arkitektur hvor komponenter afhænger af abstraktioner frem for konkrete implementeringer, hvilket muliggør fleksibel test og fremtidig udvidelse.

Service arkitekturen er designet omkring princippet om enkelt ansvar, hvor hver service håndterer et specifikt domæne problem. Denne tilgang harmonerer med Domain-Driven Design principper mens den bibeholder kompatibilitet med MAUIs livscyklus administration og krydsplatform krav.

### Service Registrering og Livstidshåndtering

Dependency injection konfigurationen demonstrerer gennemtænkt overvejelse af objekt livscyklusser og ressourcehåndtering:

```csharp
public static MauiApp CreateMauiApp()
{
    var builder = MauiApp.CreateBuilder();
    
    // Registrer Database som singleton service
    builder.Services.AddSingleton<Database>();
    
    // Registrer Core Services
    builder.Services.AddSingleton<IDialogService, DialogService>();
    builder.Services.AddSingleton<IDataService, DataService>();
    builder.Services.AddTransient<ITimerService, TimerService>();
    
    // Registrer Business Services
    builder.Services.AddTransient<IExamService, ExamService>();
    builder.Services.AddTransient<IStudentService, StudentService>();
    builder.Services.AddTransient<IExamSessionService, ExamSessionService>();
    
    // Registrer ViewModels
    builder.Services.AddTransient<ExamViewModel>();
    builder.Services.AddTransient<StudentViewModel>();
    builder.Services.AddTransient<ExamSessionViewModel>();
    builder.Services.AddTransient<HistoryViewModel>();
}
```

**Singleton Registreringer**: `Database`, `IDialogService` og `IDataService` registreres som singletons fordi de vedligeholder tilstand, der skal deles på tværs af hele applikationens livscyklus. Database forbindelsen drager især fordel af singleton livstid for at undgå gentagen initialisering af SQLite forbindelser og for at vedligeholde forbindelsespooling effektivitet.

**Transient Registreringer**: ViewModels, Pages og forretningsservices registreres som transient for at sikre ren tilstand for hver brug. Dette er særligt vigtigt for ViewModels, der vedligeholder formtilstand og for services, der måtte akkumulere tilstand under operationer.

### Interface-Baseret Design og Abstraktionslag

Vores service arkitektur anvender omfattende interface abstraktioner, der tilbyder flere arkitektoniske fordele:

```csharp
public interface IExamSessionService
{
    Task<List<Student>> GetStudentsForExamAsync(int examId);
    Task<Student?> GetCurrentStudentAsync(int examId, int currentIndex);
    Task<Student?> FindFirstUncompletedStudentAsync(int examId);
    int DrawRandomQuestion(int maxQuestions);
    string[] GetAvailableGrades();
    string FormatTime(int totalSeconds);
    string GetTimerColor(int remainingSeconds, int totalDurationSeconds);
    Task SaveStudentExamDataAsync(Student student, int questionNumber, int actualTimeMinutes, string notes, string grade);
    Task<(int Total, int Completed, string Stats)> GetExamProgressAsync(int examId);
    bool IsStudentCompleted(Student student);
    Task<string> GetStudentSummaryAsync(Student student);
    Task<bool> HasUncompletedStudentsAsync(int examId);
    Task<string> GetExamCompletionSummaryAsync(int examId);
}
```

Dette interface design demonstrerer flere vigtige mønstre:

**Sammenhængende Funktionalitet**: Interfacet grupperer relaterede operationer (studerende håndtering, eksamen fremgangssporing, formateringsværktøjer), der logisk hører sammen i eksamen session konteksten.

**Async/Await Mønster Konsistens**: Data adgangsmetoder returnerer konsistent `Task<T>` eller `Task`, hvilket muliggør responsiv UI operation uden at blokere hovedtråden.

## Data Lag og Persistering

### Database Arkitektur og Teknologivalg

Vores applikation anvender SQLite som den primære data persistering mekanisme, en beslutning drevet af flere arkitektoniske overvejelser specifikke for krydsplatform mobil og desktop applikationer. SQLite tilbyder en serverløs, selvstændig database motor, der opererer helt inden for applikationsprocessen, hvilket eliminerer eksterne afhængigheder og forenkler deployment på tværs af MAUIs målplatforme.

Database implementeringen i `Database.cs` demonstrerer sofistikerede async/await mønstre kombineret med robust fejlhåndtering og ressourcehåndtering:

```csharp
public class Database
{
    private readonly SQLiteAsyncConnection? _connection;
    private readonly Task _initializationTask;
    private bool _isInitialized = false;
    
    public Database()
    {
        try
        {
            var dataDir = FileSystem.AppDataDirectory;
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory();
            }
            var databasePath = Path.Combine(dataDir, "ExamManagement.db");
            var dbOptions = new SQLiteConnectionString(databasePath, true);
            _connection = new SQLiteAsyncConnection(dbOptions);
            _initializationTask = InitializeAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Database initialiseringsfejl: {ex.Message}");
            _initializationTask = Task.FromException(ex);
            throw;
        }
    }
}
```

**Asynkront Initialiseringsmønster**: Database konstruktøren initierer asynkron initialisering uden at blokere den kaldende tråd. Dette mønster er afgørende for MAUI applikationer, hvor UI responsivitet skal vedligeholdes under potentielt tidskrævende database operationer.

## UI Arkitektur med XAML

### XAML Fundament og Deklarativ UI Filosofi

Brugergrænsefladen arkitekturen i vores eksamen administrationssystem er bygget helt på XAML (eXtensible Application Markup Language), som tilbyder en deklarativ tilgang til UI definition, der adskiller præsentationsmarkup fra applikationslogik. Denne adskillelse er fundamental for MVVM mønsteret og gør det muligt for designere og udviklere at arbejde samarbejdende på forskellige aspekter af applikationen.

XAML i MAUI fungerer som et platform-agnostisk UI beskrivelsesprog, der oversættes til native kontrolelementer ved runtime. Vores applikation udnytter denne kapacitet til at vedligeholde konsistent visuelt design på tværs af platforme, mens den tillader platform-specifikke optimeringer og native brugeroplevelsesmønstre.

### Shell Navigation Arkitektur

Vores applikation anvender MAUIs Shell arkitektur til navigation, som tilbyder et hierarkisk, URI-baseret navigationssystem, der samler navigationsbegreber på tværs af mobil og desktop platforme:

```xml
<Shell x:Class="_2025JuneMAUI.AppShell"
       xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
       xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
       Title="Eksamen System">
    <TabBar>
        <ShellContent Title="Hjem" ContentTemplate="{DataTemplate local:MainPage}" Route="MainPage" />
        <ShellContent Title="Opret Eksamen" ContentTemplate="{DataTemplate views:ExamPage}" Route="ExamPage" />
        <ShellContent Title="Studerende" ContentTemplate="{DataTemplate views:StudentPage}" Route="StudentPage" />
        <ShellContent Title="Start Eksamen" ContentTemplate="{DataTemplate views:ExamSessionPage}" Route="ExamSessionPage" />
        <ShellContent Title="Historik" ContentTemplate="{DataTemplate views:HistoryPage}" Route="HistoryPage" />
    </TabBar>
</Shell>
```

**TabBar Navigation Mønster**: `TabBar` strukturen tilbyder et velkendt navigationsmønster, der oversættes passende på tværs af platforme - tab barer på mobile enheder og tab kontrolelementer på desktop applikationer.

### Fordele og Afvejninger

**Fordele Opnået:**
- **Langsigtet Vedligeholdelse**: Ren arkitektur reducerer teknisk gæld akkumulering
- **Test Kapacitet**: Ansvarsadskillelse muliggør omfattende unit testing
- **Team Skalerbarhed**: Klare arkitektoniske grænser gør det muligt for flere udviklere at arbejde effektivt
- **Krydsplatform Konsistens**: Enkelt kodebase reducerer platform-specifikke bugs og vedligeholdelse overhead

**Accepterede Performance Omkostninger:**
- **Reflection Overhead**: Data binding og dependency injection introducerer minimal men målbar performance overhead
- **Hukommelsesforbrug**: Yderligere abstraktionslag forbruger mere hukommelse end direkte implementeringer
- **Starttid**: Service registrering og XAML kompilering skaber lidt længere applikationsstartider

## Applikationsstruktur og Ansvarsadskillelse

### Projektorganisation og Arkitektoniske Lag

Vores eksamen administrationssystem anvender en sofistikeret lagdelt arkitektur, der fremmer vedligeholdelse, testbarhed og klar ansvarsadskillelse. Projektstrukturen reflekterer Domain-Driven Design principper mens den imødekommer MAUIs platform-specifikke krav:

```
2025JuneMAUI/
├── Data/                    # Data Adgangslag
│   └── Database.cs          # SQLite database implementation
├── Models/                  # Domæne Modeller
│   ├── Exam.cs             # Kerne forretningsentiteter
│   ├── ExamSession.cs      
│   └── Student.cs          
├── Services/               # Forretningslogik Lag
│   ├── Interfaces/         # Service kontrakter
│   └── Implementations/    # Konkrete services
├── ViewModels/             # Præsentationslogik Lag
│   └── BaseViewModel.cs    # Almindelig funktionalitet
├── Views/                  # Præsentationslag
│   ├── BaseContentPage.cs  # Almindelig side funktionalitet
│   └── Pages/              # Specifikke side implementeringer
├── Resources/              # Applikations Ressourcer
│   ├── Styles/             # XAML styling
│   ├── Images/             # Billede assets
│   └── Fonts/              # Typografi assets
└── Platforms/              # Platform-specifik kode
    ├── Android/
    ├── iOS/
    ├── Windows/
    └── MacCatalyst/
```

### Lagdelt Arkitektur Implementation

**Data Adgangslag**: `Data` mappen indeholder database implementering og data adgangsmønstre. Dette lag er ansvarligt for data persistering, hentning og grundlæggende data validering. Isolationen af data adgangslogik muliggør potentiel fremtidig migration til forskellige lagerteknologier uden at påvirke forretningslogikken.

**Domæne Model Lag**: `Models` mappen indeholder rene C# klasser, der repræsenterer kernens forretningsentiteter. Disse modeller er annoteret med SQLite attributter men forbliver fokuseret på data repræsentation frem for adfærd, hvilket følger Single Responsibility Princippet.

**Service Lag**: `Services` mappen implementerer forretningslogik laget gennem en samling af fokuserede services. Interface/implementering adskillelsen i dette lag muliggør dependency injection, testbarhed og potentielle fremtidige service kompositionsscenarier.

### Base Klasse Hierarkier og Kodegenbrug

Applikationen anvender strategiske arvehierarkier, der fremmer kodegenbrug mens den bibeholder fleksibilitet:

```csharp
public abstract class BaseContentPage<TViewModel> : ContentPage where TViewModel : BaseViewModel
{
    protected readonly TViewModel ViewModel;
    
    protected BaseContentPage(TViewModel viewModel)
    {
        ViewModel = viewModel;
        BindingContext = viewModel;
    }
    
    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await OnPageAppearing();
    }
    
    protected virtual async Task OnPageAppearing()
    {
        // Override i afledte klasser for side-specifik initialisering
        await Task.CompletedTask;
    }
}
```

**Generiske Base Klasser**: `BaseContentPage<TViewModel>` klassen tilbyder et stærkt-typet fundament for side implementeringer mens den etablerer konsistente ViewModel binding mønstre.

## Performance Overvejelser

### Hukommelseshåndtering og Ressourceoptimering

Vores applikation implementerer flere strategier til at optimere hukommelsesforbrug og forhindre almindelige performance problemer i krydsplatform applikationer:

**ViewModel Livscyklus Håndtering**: ViewModels registreres som transient services for at sikre ren tilstand for hver side navigation, hvilket forhindrer hukommelseslækager fra akkumuleret tilstand eller event handler referencer.

**Database Forbindelsespooling**: Singleton database registreringen sikrer forbindelsesgenbrug mens det asynkrone initialiseringsmønster forhindrer blokerende operationer under applikationsstart.

**Billede og Ressource Optimering**: Applikationen anvender MAUIs ressourcesystem til optimal billedeskalering og platform-specifik ressourcevalg, hvilket reducerer hukommelsesaftryk på tværs af forskellige skærmtætheder.

### Asynkrone Programmeringsmønstre

Applikationen anvender omfattende async/await mønstre for at vedligeholde UI responsivitet mens den udfører potentielt blokerende operationer:

```csharp
private async Task<T> ExecuteAsync<T>(Func<SQLiteAsyncConnection, Task<T>> operation, T defaultValue = default!)
{
    await EnsureInitializedAsync();
    if (_connection == null) return defaultValue;
    return await operation(_connection);
}
```

**Ikke-Blokerende Database Operationer**: Alle database operationer bruger asynkrone metoder for at forhindre UI tråd blokering, hvilket sikrer responsiv brugeroplevelse under data adgangsoperationer.

## Designbeslutninger og Afvejninger

### Arkitekturfilosofi og Strategiske Valg

Vores designbeslutninger reflekterer en strategisk prioritering af vedligeholdelse, testbarhed og krydsplatform konsistens over maksimal performance optimering. Denne filosofi anerkender, at eksamen administrationsdomænet har forudsigelige performance karakteristika, der ikke kræver ekstrem optimering.

### Teknologivalg Begrundelse

**MAUI Over Xamarin.Forms**: Valget af MAUI tilbyder adgang til de seneste .NET runtime funktioner, forbedret performance og samlet projektstruktur mens det bibeholder krydsplatform kapaciteter.

**SQLite Over Cloud Database**: Lokal database lagring tilbyder offline funktionalitet, eliminerer netværksafhængighed og forenkler deployment mens det møder single-bruger anvendelsesmønstre typisk for eksamenadministrationsscenarier.

**MVVM Over Code-Behind**: Den omfattende MVVM implementering muliggør unit testing, ansvarsadskillelse og potentiel fremtidig UI teknologimigration til omkostningen af indledende kompleksitet.

**Dependency Injection Over Statiske Afhængigheder**: DI tilgangen forbedrer testbarhed og fleksibilitet mens den introducerer noget runtime overhead og arkitektonisk kompleksitet.

### Performance vs. Vedligeholdelse Afvejninger

**Fordele ved Nuværende Tilgang:**
- **Langsigtet Vedligeholdelse**: Ren arkitektur reducerer teknisk gæld akkumulering
- **Test Kapacitet**: Ansvarsadskillelse muliggør omfattende unit testing
- **Team Skalerbarhed**: Klare arkitektoniske grænser muliggør flere udviklere at arbejde effektivt
- **Krydsplatform Konsistens**: Enkelt kodebase reducerer platform-specifikke bugs og vedligeholdelse overhead

**Accepterede Performance Omkostninger:**
- **Reflection Overhead**: Data binding og dependency injection introducerer minimal men målbar performance overhead
- **Hukommelsesforbrug**: Yderligere abstraktionslag forbruger mere hukommelse end direkte implementeringer
- **Starttid**: Service registrering og XAML kompilering skaber lidt længere applikationsstartider

### Fremtidig Skalerbarhed Overvejelser

Den nuværende arkitektur positionerer applikationen til flere potentielle evolutionsscenarier:

**Data Lag Evolution**: `IDataService` abstraktionen muliggør migration til forskellige database teknologier eller introduktion af caching lag uden forretningslogik ændringer.

**UI Teknologi Migration**: Den komplette adskillelse af præsentationslogik i ViewModels muliggør potentiel migration til forskellige UI frameworks mens forretningslogik investeringer bevares.

**Service Komposition**: Den interface-baserede service arkitektur understøtter fremtidige kompositionsscenarier, såsom tilføjelse af autentificering, logging eller analytics services uden arkitektoniske ændringer.

**Test Strategi Forbedring**: De nuværende arkitektoniske mønstre understøtter introduktion af omfattende unit testing, integration testing og UI automatiserings test frameworks.

### Konklusion

Dette eksamen administrationssystem demonstrerer en gennemtænkt anvendelse af moderne .NET MAUI arkitektoniske mønstre, der balancerer umiddelbare funktionalitetsbehov med langsigtet vedligeholdelse bekymringer. Den omfattende brug af MVVM, dependency injection og service-orienteret arkitektur skaber et fundament, der understøtter både nuværende krav og fremtidig evolution mens den bibeholder de krydsplatform fordele, der gør MAUI til et overbevisende valg for forretningsapplikationsudvikling.

Den arkitektoniske investering i rene kodemønstre, ordentlig ansvarsadskillelse og omfattende abstraktionslag positionerer denne applikation som en vedligeholdelig, testbar og skalerbar løsning, der effektivt udnytter kapaciteterne i .NET MAUI platformen mens den bibeholder fleksibiliteten til at udvikle sig med skiftende forretningskrav.

---

## Eksamensforberedelse: Fundamentale .NET og MAUI Koncepter

Denne sektion giver en dybdegående gennemgang af de centrale koncepter og mønstre, der bruges i moderne .NET MAUI udvikling, specifikt illustreret gennem vores eksamen administrationssystem.

### 1. .NET Framework Principper og Arkitektur

#### .NET Runtime og Base Class Library (BCL)

.NET frameworket er bygget på flere fundamentale principper, der direkte påvirker vores applikationsdesign. Vores MAUI applikation udnytter .NET 9.0, den nyeste version af .NET, som tilbyder forbedret performance og krydsplatform kompatibilitet:

```xml
<TargetFrameworks>net9.0-android;net9.0-ios;net9.0-maccatalyst</TargetFrameworks>
<TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net9.0-windows10.0.19041.0</TargetFrameworks>
```

**Managed Code Execution**: Vores C# kode kompileres til Intermediate Language (IL), som kører på Common Language Runtime (CLR). Dette muliggør:

- **Automatisk Hukommelseshåndtering**: Garbage Collector (GC) administrerer hukommelse automatisk, som vi ser i vores database forbindelser:

```csharp
public class Database
{
    private readonly SQLiteAsyncConnection? _connection;
    
    // GC vil automatisk rydde op i connection når den ikke længere bruges
    // Dette forhindrer hukommelseslækager uden eksplicit disposal
}
```

- **Type Safety**: Stærk typning forhindrer runtime fejl og muliggør compile-time validering:

```csharp
[ObservableProperty]
private Exam? selectedExam; // Nullable reference type sikrer null-safety

public async Task<List<Student>> GetStudentsForExamAsync(int examId) 
{
    // Return type garanterer, at metoden altid returnerer en List<Student>
    return await ExecuteAsync(conn => conn.Table<Student>()
        .Where(s => s.ExamId == examId)
        .ToListAsync(), new List<Student>());
}
```

**Common Type System (CTS)**: Alle .NET sprog deler det samme type system, hvilket muliggør interoperabilitet. Vores modeller demonstrerer dette:

```csharp
[Table("Students")]
public class Student  // Class type fra CTS
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }  // Value type (int) fra CTS
    
    public string StudentNo { get; set; } = string.Empty;  // Reference type fra CTS
    public DateTime CreatedAt { get; set; } = DateTime.Now;  // Struct type fra CTS
}
```

#### .NET Standard og Platform Abstraktion

Vores applikation udnytter .NET's platform abstraktion gennem standardiserede APIs:

```csharp
// FileSystem.AppDataDirectory oversættes automatisk til platform-specifikke stier:
// Windows: %APPDATA%/CompanyName/AppName
// iOS: ~/Documents
// Android: Internal storage
var dataDir = FileSystem.AppDataDirectory;
var databasePath = Path.Combine(dataDir, "ExamManagement.db");
```

### 2. C# Programudvikling Principper

#### Objektorienterede Programmeringskoncepter

**Encapsulation (Indkapsling)**: Vores service klasser demonstrerer proper encapsulation:

```csharp
public class ExamSessionService : IExamSessionService
{
    private readonly IDataService _dataService;  // Private fields
    private readonly Random _random = new();     // Encapsulated state
    private readonly string[] _danishGrades = { "-3", "00", "02", "4", "7", "10", "12" };
    
    // Public interface skjuler implementationsdetaljer
    public string[] GetAvailableGrades() => _danishGrades;
    
    // Privat logik eksponeres ikke til eksterne klienter
    private async Task<List<Student>> GetCompletedStudents(int examId)
    {
        var students = await _dataService.GetStudentsByExamIdAsync(examId);
        return students.Where(s => !string.IsNullOrEmpty(s.Grade)).ToList();
    }
}
```

**Inheritance (Arv)**: Vores ViewModel hierarki viser strategisk brug af arv:

```csharp
// Base klasse definerer fælles funktionalitet
public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool isBusy;
    
    protected virtual async Task ExecuteAsync(Func<Task> operation, IDialogService? dialogService = null)
    {
        if (IsBusy) return;
        IsBusy = true;
        try { await operation(); }
        catch (Exception ex) { /* Error handling */ }
        finally { IsBusy = false; }
    }
}

// Afledte klasser arver og udvider base funktionalitet
public partial class ExamViewModel : BaseViewModel
{
    private readonly IExamService _examService;
    
    [RelayCommand]
    private async Task CreateExam() => await ExecuteAsync(async () =>
    {
        // Bruger inherited ExecuteAsync metode
        await _examService.CreateExamAsync(ExamTermin, CourseName, /* ... */);
    });
}
```

**Polymorphism (Polymorfi)**: Interface-baseret design muliggør polymorfi:

```csharp
// Interface definerer kontrakt
public interface IDialogService
{
    Task ShowAlertAsync(string title, string message);
    Task<bool> ShowConfirmAsync(string title, string message);
}

// Forskellige implementeringer for forskellige platforme
public class DialogService : IDialogService
{
    public async Task ShowAlertAsync(string title, string message) => 
        await Shell.Current.DisplayAlert(title, message, "OK");
}

// Client kode kan arbejde med enhver implementation
public class ExamService
{
    private readonly IDialogService _dialogService;  // Polymorfi gennem interface
    
    public async Task<bool> DeleteExamAsync(int examId)
    {
        // Fungerer med enhver IDialogService implementation
        var confirmed = await _dialogService.ShowConfirmAsync("Slet", "Er du sikker?");
        if (confirmed) { /* Delete logic */ }
        return confirmed;
    }
}
```

#### Moderne C# Features

**Async/Await Pattern**: Grundlæggende for responsiv UI:

```csharp
public async Task<List<Student>> GetStudentsForExamAsync(int examId)
{
    // await frigiver UI thread mens operation udføres
    return await ExecuteAsync(async conn => 
    {
        return await conn.Table<Student>()
            .Where(s => s.ExamId == examId)
            .OrderBy(s => s.ExaminationOrder)
            .ToListAsync();
    }, new List<Student>());
}
```

**Pattern Matching og Switch Expressions**: Moderne C# syntaks:

```csharp
public string GetTimerColor(int remainingSeconds, int totalDurationSeconds)
{
    var ratio = (double)remainingSeconds / totalDurationSeconds;
    return ratio switch  // Switch expression
    {
        > 0.5 => "#22C55E",   // Pattern matching
        > 0.25 => "#F59E0B", 
        _ => "#DC2626"        // Discard pattern
    };
}
```

**Nullable Reference Types**: Type safety forbedringer:

```csharp
public class Database
{
    private readonly SQLiteAsyncConnection? _connection;  // Nullable annotation
    
    public async Task<Exam?> GetExamAsync(int id)  // Return type kan være null
    {
        if (_connection == null) return null;  // Null check required
        return await _connection.Table<Exam>().Where(e => e.Id == id).FirstOrDefaultAsync();
    }
}
```

**Record Types og Value Objects**: For uforanderlige data:

```csharp
// Kunne bruges til value objects
public record ExamProgress(int Total, int Completed, string Stats);

public async Task<ExamProgress> GetExamProgressAsync(int examId)
{
    var total = await _dataService.GetTotalStudentsForExamAsync(examId);
    var completed = await _dataService.GetCompletedStudentsForExamAsync(examId);
    var stats = $"{completed}/{total} studerende færdige";
    
    return new ExamProgress(total, completed, stats);  // Immutable record
}
```

### 3. GUI Design med Kontroller og Layout Panels

#### XAML Layout System

**Layout Panels og Hierarki**: Vores UI bruger nested layouts for struktureret design:

```xml
<ScrollView>
    <!-- Ydre container til scrolling -->
    <VerticalStackLayout Padding="32" Spacing="32">
        <!-- Vertikal stacking med consistent spacing -->
        
        <StackLayout Spacing="8" HorizontalOptions="Center">
            <!-- Indre layout for header elementer -->
            <Label Text="Eksamen System" Style="{StaticResource Headline}" />
            <Label Text="Administrer mundtlige eksamener" Style="{StaticResource SubHeadline}" />
        </StackLayout>
        
        <StackLayout Spacing="16">
            <!-- Navigation buttons med mindre spacing -->
            <Button Text="Opret Eksamen" Command="{Binding NavigateToExamCommand}" />
            <Button Text="Administrer Studerende" Command="{Binding NavigateToStudentCommand}" />
        </StackLayout>
        
        <Border Style="{StaticResource CardStyle}" Padding="24">
            <!-- Card layout for information -->
            <StackLayout Spacing="16">
                <Label Text="Funktioner" Style="{StaticResource Subtitle}" />
                <StackLayout Spacing="8">
                    <!-- Nested layout for feature list -->
                    <Label Text="• Opret og administrer eksamener" />
                    <Label Text="• Tilføj studerende til eksamener" />
                </StackLayout>
            </StackLayout>
        </Border>
    </VerticalStackLayout>
</ScrollView>
```

**Control Properties og Data Binding**: Kontrolelementer forbindes til ViewModels:

```xml
<!-- Entry control med two-way binding -->
<Entry Text="{Binding StudentNo}" 
       Placeholder="Studienummer"
       IsEnabled="{Binding CanEditStudent}" />

<!-- Picker control med ItemsSource binding -->
<Picker ItemsSource="{Binding AvailableGrades}" 
        SelectedItem="{Binding Grade}"
        Title="Vælg karakter"
        IsEnabled="{Binding CanEnterGrade}" />

<!-- Button med Command binding -->
<Button Text="Gem Studerende" 
        Command="{Binding SaveStudentCommand}"
        IsVisible="{Binding ShowSaveButton}" />
```

**Style System og Resources**: Centraliseret styling:

```xml
<Application.Resources>
    <ResourceDictionary>
        <!-- Color definitions -->
        <Color x:Key="Primary">#512BD4</Color>
        <Color x:Key="Secondary">#DFD8F7</Color>
        
        <!-- Style definitions -->
        <Style x:Key="Headline" TargetType="Label">
            <Setter Property="FontSize" Value="32" />
            <Setter Property="FontWeight" Value="Bold" />
            <Setter Property="TextColor" Value="{StaticResource Primary}" />
        </Style>
        
        <Style x:Key="CardStyle" TargetType="Border">
            <Setter Property="BackgroundColor" Value="{StaticResource Secondary}" />
            <Setter Property="StrokeThickness" Value="0" />
            <Setter Property="StrokeShape" Value="RoundRectangle 8" />
        </Style>
    </ResourceDictionary>
</Application.Resources>
```

#### Responsive Design Patterns

**Adaptive Layouts**: Layout tilpasser sig forskellige skærmstørrelser:

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />    <!-- Header shrinks to content -->
        <RowDefinition Height="*" />       <!-- Content takes remaining space -->
        <RowDefinition Height="Auto" />    <!-- Footer shrinks to content -->
    </Grid.RowDefinitions>
    
    <!-- Content tilpasser sig tilgængeligt plads -->
    <CollectionView Grid.Row="1" ItemsSource="{Binding Students}">
        <CollectionView.ItemTemplate>
            <DataTemplate>
                <Grid Padding="16">
                    <!-- Item layout der skalerer -->
                </Grid>
            </DataTemplate>
        </CollectionView.ItemTemplate>
    </CollectionView>
</Grid>
```

### 4. Navigation mellem Pages

#### Shell Navigation Architecture

**URI-baseret Navigation**: MAUI Shell tilbyder moderne navigation:

```xml
<!-- AppShell.xaml definerer navigation struktur -->
<Shell x:Class="_2025JuneMAUI.AppShell" Title="Eksamen System">
    <TabBar>
        <ShellContent Title="Hjem" 
                      ContentTemplate="{DataTemplate local:MainPage}" 
                      Route="MainPage" />
        <ShellContent Title="Opret Eksamen" 
                      ContentTemplate="{DataTemplate views:ExamPage}" 
                      Route="ExamPage" />
        <ShellContent Title="Start Eksamen" 
                      ContentTemplate="{DataTemplate views:ExamSessionPage}" 
                      Route="ExamSessionPage" />
    </TabBar>
</Shell>
```

**Programmatisk Navigation**: Navigation gennem ViewModels:

```csharp
public partial class MainPageViewModel : BaseViewModel
{
    [RelayCommand]
    private async Task NavigateToExamPage()
    {
        // Shell navigation med route
        await Shell.Current.GoToAsync("//ExamPage");
    }
    
    [RelayCommand]
    private async Task NavigateToExamSession(int examId)
    {
        // Navigation med parametre
        await Shell.Current.GoToAsync($"//ExamSessionPage?examId={examId}");
    }
}
```

**Navigation Parameters og Query Strings**: Data passing mellem pages:

```csharp
[QueryProperty(nameof(ExamId), "examId")]
public partial class ExamSessionViewModel : BaseViewModel
{
    [ObservableProperty]
    private int examId;
    
    partial void OnExamIdChanged(int value)
    {
        // Reagerer på navigation parameter
        if (value > 0)
        {
            LoadExamData(value);
        }
    }
    
    private async Task LoadExamData(int id)
    {
        var exam = await _examService.GetExamAsync(id);
        if (exam != null)
        {
            SelectedExam = exam;
            await LoadStudents(id);
        }
    }
}
```

#### Page Lifecycle Management

**Base Page Pattern**: Consistent lifecycle handling:

```csharp
public abstract class BaseContentPage<TViewModel> : ContentPage 
    where TViewModel : BaseViewModel
{
    protected readonly TViewModel ViewModel;
    
    protected BaseContentPage(TViewModel viewModel)
    {
        ViewModel = viewModel;
        BindingContext = viewModel;  // Etablerer data context
    }
    
    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await OnPageAppearing();  // Custom initialization
    }
    
    protected virtual async Task OnPageAppearing()
    {
        // Override i afledte klasser
        await Task.CompletedTask;
    }
}

// Konkret page implementation
public partial class ExamPage : BaseContentPage<ExamViewModel>
{
    public ExamPage(ExamViewModel viewModel) : base(viewModel) => InitializeComponent();
    
    protected override async Task OnPageAppearing()
    {
        // Page-specifik initialisering
        await ViewModel.LoadExamsCommand.ExecuteAsync(null);
    }
}
```

### 5. Dependency Injection og Host Builder Pattern

#### Service Container Configuration

**MauiProgram og Host Builder**: Centraliseret service konfiguration:

```csharp
public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder.UseMauiApp<App>()
               .ConfigureFonts(fonts => { /* Font configuration */ });

        // Core Infrastructure Services
        builder.Services.AddSingleton<Database>();
        builder.Services.AddSingleton<IDialogService, DialogService>();
        builder.Services.AddSingleton<IDataService, DataService>();
        
        // Business Services med forskellige lifetimes
        builder.Services.AddTransient<IExamService, ExamService>();
        builder.Services.AddTransient<IStudentService, StudentService>();
        builder.Services.AddTransient<IExamSessionService, ExamSessionService>();
        builder.Services.AddTransient<ITimerService, TimerService>();
        
        // ViewModels som transient for clean state
        builder.Services.AddTransient<ExamViewModel>();
        builder.Services.AddTransient<StudentViewModel>();
        builder.Services.AddTransient<ExamSessionViewModel>();
        
        // Pages med dependency injection
        builder.Services.AddTransient<ExamPage>();
        builder.Services.AddTransient<StudentPage>();
        
        return builder.Build();
    }
}
```

#### Service Lifetimes og Scoping

**Singleton Services**: Delt tilstand gennem app lifetime:

```csharp
// Database connection skal være singleton for performance
builder.Services.AddSingleton<Database>();

public class Database
{
    private readonly SQLiteAsyncConnection? _connection;
    
    public Database()
    {
        // Connection etableres en gang og genbruges
        var databasePath = Path.Combine(FileSystem.AppDataDirectory, "ExamManagement.db");
        _connection = new SQLiteAsyncConnection(databasePath, true);
    }
}
```

**Transient Services**: Ny instance for hver brug:

```csharp
// ViewModels skal være transient for clean state
builder.Services.AddTransient<ExamViewModel>();

public partial class ExamViewModel : BaseViewModel
{
    public ExamViewModel(IExamService examService)
    {
        // Hver page navigation får en fresh ViewModel instance
        _examService = examService;
        // Clean state - ingen leftover data fra tidligere brug
    }
}
```

#### Constructor Injection Pattern

**Service Dependencies**: Services modtager dependencies gennem constructor:

```csharp
public class ExamService : IExamService
{
    private readonly IDataService _dataService;
    private readonly IDialogService _dialogService;
    
    // Constructor injection - dependencies leveres automatisk
    public ExamService(IDataService dataService, IDialogService dialogService)
    {
        _dataService = dataService;
        _dialogService = dialogService;
    }
    
    public async Task<Exam> CreateExamAsync(string termim, string courseName, /* parameters */)
    {
        // Brug injected dependencies
        var exam = new Exam { ExamTermin = termim, CourseName = courseName /* ... */ };
        await _dataService.AddExamAsync(exam);
        await _dialogService.ShowAlertAsync("Success", "Eksamen oprettet");
        return exam;
    }
}
```

**Interface Abstractions**: Loose coupling gennem interfaces:

```csharp
// Interface definerer kontrakt
public interface IDataService
{
    Task<List<Exam>> GetExamsAsync();
    Task<int> AddExamAsync(Exam exam);
    Task<int> UpdateExamAsync(Exam exam);
    Task<int> DeleteExamAsync(Exam exam);
}

// Implementation kan skiftes uden at påvirke consumers
public class DataService : IDataService
{
    private readonly Database _database;
    
    public DataService(Database database) => _database = database;
    
    public async Task<List<Exam>> GetExamsAsync() => await _database.GetExamsAsync();
    // Resten af implementation...
}
```

### 6. MVVM Arkitektur med C# og XAML

#### Model Layer Design

**Domain Models**: Pure data representations:

```csharp
[Table("Students")]
public class Student
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }
    
    public int ExamId { get; set; }  // Foreign key relationship
    public string StudentNo { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int QuestionNo { get; set; }
    public string Grade { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Modeller indeholder kun data, ingen business logic
}
```

**Business Rules i Services**: Forretningslogik separeret fra data:

```csharp
public static class GradeCalculationService
{
    private static readonly Dictionary<string, int> GradeValues = new()
    {
        { "-3", -3 }, { "00", 0 }, { "02", 2 }, { "4", 4 }, 
        { "7", 7 }, { "10", 10 }, { "12", 12 }
    };
    
    public static string CalculateAverageGrade(IEnumerable<Student> students)
    {
        var validGrades = students
            .Where(s => !string.IsNullOrEmpty(s.Grade) && GradeValues.ContainsKey(s.Grade))
            .Select(s => GradeValues[s.Grade])
            .ToList();
        
        if (!validGrades.Any()) return "N/A";
        
        var average = validGrades.Average();
        return GradeValues.OrderBy(kvp => Math.Abs(kvp.Value - average)).First().Key;
    }
}
```

#### ViewModel Implementation

**Observable Properties**: Source-generated properties for UI binding:

```csharp
public partial class ExamSessionViewModel : BaseViewModel
{
    // Source generator skaber INotifyPropertyChanged implementation
    [ObservableProperty]
    private Exam? selectedExam;
    
    [ObservableProperty]
    private Student? currentStudent;
    
    [ObservableProperty] 
    private bool isExamStarted;
    
    [ObservableProperty]
    private string timerDisplay = "00:00";
    
    // Partial method til reaction på property changes
    partial void OnCurrentStudentChanged(Student? value)
    {
        if (value != null)
        {
            StudentInfo = $"{value.FirstName} {value.LastName} ({value.StudentNo})";
            UpdateUIForStudent(value);
        }
    }
}
```

**Command Pattern**: User interactions som commands:

```csharp
public partial class ExamSessionViewModel : BaseViewModel
{
    [RelayCommand]
    private async Task StartExam()
    {
        await ExecuteAsync(async () =>
        {
            if (SelectedExam?.Id <= 0) 
            {
                await _dialogService.ShowAlertAsync("Fejl", "Vælg eksamen først");
                return;
            }
            
            IsExamStarted = true;
            ShowExamSelection = false;
            await LoadStudents(SelectedExam.Id);
            
        }, _dialogService);
    }
    
    [RelayCommand]
    private void DrawQuestion()
    {
        if (SelectedExam == null) return;
        
        _drawnQuestionNumber = _examSessionService.DrawRandomQuestion(SelectedExam.NumberOfQuestions);
        DrawnQuestionDisplay = $"Spørgsmål: {_drawnQuestionNumber}";
        HasDrawnQuestion = true;
        ShowStartExaminationButton = true;
    }
    
    [RelayCommand(CanExecute = nameof(CanSaveStudentData))]
    private async Task SaveStudentData()
    {
        if (CurrentStudent == null) return;
        
        await ExecuteAsync(async () =>
        {
            var actualMinutes = _timerService.GetElapsedMinutes();
            await _examSessionService.SaveStudentExamDataAsync(
                CurrentStudent, _drawnQuestionNumber, actualMinutes, Notes, Grade);
            
            await ShowNextStudent();
            
        }, _dialogService);
    }
    
    private bool CanSaveStudentData() => 
        CurrentStudent != null && !string.IsNullOrEmpty(Grade) && HasDrawnQuestion;
}
```

#### View-ViewModel Binding

**Data Binding Expressions**: XAML connectivity til ViewModels:

```xml
<ContentPage x:Class="_2025JuneMAUI.Views.ExamSessionPage"
             BindingContext="{Binding Source={x:Static local:ServiceHelper.ExamSessionViewModel}}">
    
    <!-- Two-way binding til ViewModel properties -->
    <StackLayout IsVisible="{Binding ShowExamSelection}">
        <Picker ItemsSource="{Binding Exams}" 
                SelectedItem="{Binding SelectedExam}"
                DisplayMemberPath="CourseName" />
        
        <Button Text="Start Eksamen" 
                Command="{Binding StartExamCommand}"
                IsEnabled="{Binding IsNotBusy}" />
    </StackLayout>
    
    <!-- Conditional UI baseret på ViewModel state -->
    <StackLayout IsVisible="{Binding IsExamStarted}">
        <Label Text="{Binding ExamInfo}" Style="{StaticResource Headline}" />
        <Label Text="{Binding StudentInfo}" Style="{StaticResource Subtitle}" />
        <Label Text="{Binding ProgressInfo}" />
        
        <!-- Timer display med color binding -->
        <Label Text="{Binding TimerDisplay}" 
               TextColor="{Binding TimerColor}"
               Style="{StaticResource TimerStyle}" />
        
        <!-- Command binding med parameter -->
        <Button Text="Træk Spørgsmål" 
                Command="{Binding DrawQuestionCommand}"
                IsVisible="{Binding ShowDrawQuestionButton}" />
        
        <!-- Data entry controls -->
        <Entry Text="{Binding Notes}" 
               Placeholder="Noter til eksamen"
               IsEnabled="{Binding CanEditNotes}" />
        
        <Picker ItemsSource="{Binding AvailableGrades}"
                SelectedItem="{Binding Grade}"
                IsEnabled="{Binding CanEnterGrade}" />
    </StackLayout>
</ContentPage>
```

**Value Converters og Triggers**: Advanced binding scenarios:

```xml
<ContentPage.Resources>
    <!-- Value converter til boolean til visibility -->
    <converters:BoolToVisibilityConverter x:Key="BoolToVisibility" />
    
    <!-- Custom converter til timer farve -->
    <converters:TimerColorConverter x:Key="TimerColor" />
</ContentPage.Resources>

<Label Text="{Binding TimerDisplay}">
    <Label.TextColor>
        <MultiBinding Converter="{StaticResource TimerColor}">
            <Binding Path="RemainingSeconds" />
            <Binding Path="TotalDurationSeconds" />
        </MultiBinding>
    </Label.TextColor>
    
    <!-- Visual State Manager for animations -->
    <VisualStateManager.VisualStateGroups>
        <VisualStateGroup Name="TimerStates">
            <VisualState Name="Normal">
                <VisualState.Setters>
                    <Setter Property="TextColor" Value="Green" />
                </VisualState.Setters>
            </VisualState>
            <VisualState Name="Warning">
                <VisualState.Setters>
                    <Setter Property="TextColor" Value="Orange" />
                </VisualState.Setters>
            </VisualState>
            <VisualState Name="Critical">
                <VisualState.Setters>
                    <Setter Property="TextColor" Value="Red" />
                </VisualState.Setters>
            </VisualState>
        </VisualStateGroup>
    </VisualStateManager.VisualStateGroups>
</Label>
```

#### MVVM Benefits og Best Practices

**Testability**: ViewModels kan testes isoleret:

```csharp
[Test]
public async Task StartExam_WithValidExam_ShouldInitializeSession()
{
    // Arrange
    var mockExamService = new Mock<IExamService>();
    var mockDialogService = new Mock<IDialogService>();
    var viewModel = new ExamSessionViewModel(mockExamService.Object, /* other mocks */);
    
    var exam = new Exam { Id = 1, CourseName = "Test Course" };
    viewModel.SelectedExam = exam;
    
    // Act
    await viewModel.StartExamCommand.ExecuteAsync(null);
    
    // Assert
    Assert.IsTrue(viewModel.IsExamStarted);
    Assert.IsFalse(viewModel.ShowExamSelection);
    mockExamService.Verify(x => x.GetStudentsForExamAsync(1), Times.Once);
}
```

**Separation of Concerns**: Klar ansvarsfordeling:

- **View**: Kun presentation og user interaction
- **ViewModel**: Presentation logic og state management  
- **Model**: Data representation og business rules
- **Services**: Business logic og data access

Denne arkitektur sikrer maintainable, testable og scalable kode, der følger moderne .NET udviklings best practices.

---

## Garbage Collection i .NET: Teori og Praktisk Implementation

### Hvad er Garbage Collection og Hvorfor er Det Vigtigt

Garbage Collection (GC) er en automatisk hukommelseshåndteringsmekanisme i .NET, der frigør hukommelse optaget af objekter, som ikke længere bruges af applikationen. I modsætning til sprog som C eller C++, hvor udviklere manuelt skal allokere og frigøre hukommelse, håndterer .NET's GC denne proces automatisk, hvilket reducerer risikoen for hukommelseslækager og pointer fejl.

Vores MAUI eksamen administrationssystem drager stor fordel af GC, især i de mange asynkrone operationer og UI opdateringer, der sker under eksamen sessioner.

### Hvordan Garbage Collection Fungerer Bag Scenen

#### .NET's Memory Model og Generational Hypothesis

.NET's GC bygger på den generational hypothesis: de fleste objekter har kort levetid, mens objekter der overlever den første GC cyklus har tendens til at leve længere. GC'en organiserer hukommelsen i tre generationer:

**Generation 0**: Nye objekter allokeres her. Dette er den mest effektive generation at rydde op i.
**Generation 1**: Objekter der overlevede mindst én GC fra Generation 0.
**Generation 2**: Langlivede objekter og store objekter (Large Object Heap).

I vores applikation kan vi se dette mønster:

```csharp
// Generation 0 objekter - kortlivede operationer
public async Task SaveStudentData()
{
    // Lokale variabler bliver allokeret i Generation 0
    var actualMinutes = _timerService.GetElapsedMinutes();
    var student = CurrentStudent; // Reference, ikke ny allokering
    
    // String concatenation skaber kortlivede objekter
    var message = $"Data gemt for {student?.FirstName} {student?.LastName}";
    
    // Disse objekter vil hurtigt blive garbage collected
    await _examSessionService.SaveStudentExamDataAsync(CurrentStudent, _drawnQuestionNumber, actualMinutes, Notes, Grade);
}
```

```csharp
// Generation 2 objekter - langlivede services
public class Database
{
    private readonly SQLiteAsyncConnection? _connection; // Langlivet objekt
    
    public Database()
    {
        // Database forbindelsen lever gennem hele applikationens levetid
        _connection = new SQLiteAsyncConnection(databasePath, true);
    }
}
```

#### Mark-and-Sweep Algoritme

GC bruger en mark-and-sweep algoritme:

1. **Mark Phase**: GC identificerer alle objekter der er tilgængelige fra application roots (static felter, lokale variabler, CPU registre)
2. **Sweep Phase**: Alle objekter der ikke blev markeret frigøres
3. **Compact Phase**: Hukommelsen komprimeres for at reducere fragmentering

### Garbage Collection i Vores MAUI Applikation

#### Observable Collections og Memory Management

Vores ViewModels bruger `ObservableCollection<T>`, som kan akkumulere event listeners hvis ikke håndteret korrekt:

```csharp
public partial class ExamSessionViewModel : BaseViewModel, IDisposable
{
    public ObservableCollection<Exam> Exams { get; } = new();
    public ObservableCollection<Student> Students { get; } = new();
    
    // Proper disposal pattern for event handlers
    public void Dispose() => _timerService.TimerTick -= OnTimerTick;
}
```

**GC Påvirkning**: ObservableCollections holder referencer til UI elementer gennem data binding. Hvis ViewModels ikke disposes korrekt, kan dette forhindre GC i at frigøre UI objekter.

#### Service Lifetimes og GC Pressure

Vores dependency injection konfiguration påvirker direkte GC belastning:

```csharp
// Singleton services - lever i Generation 2, minimerer GC pressure
builder.Services.AddSingleton<Database>();
builder.Services.AddSingleton<IDialogService, DialogService>();

// Transient services - skabes og frigøres ofte, påvirker Generation 0
builder.Services.AddTransient<ExamViewModel>();
builder.Services.AddTransient<ITimerService, TimerService>();
```

**Singleton Services Fordele**:
- Database connection lever i Generation 2, undgår gentagne allocations
- Reducerer GC pressure fra hyppig objektskabelse

**Transient Services Trade-offs**:
- Nye instances for hver brug sikrer ren tilstand
- Øger Generation 0 allocations, men disse frigøres hurtigt

#### Asynchronous Operations og GC

Vores async/await mønstre påvirker GC adfærd betydeligt:

```csharp
private async Task<T> ExecuteAsync<T>(Func<SQLiteAsyncConnection, Task<T>> operation, T defaultValue = default!)
{
    await EnsureInitializedAsync(); // Await skaber state machine objekter
    if (_connection == null) return defaultValue;
    
    // Lambda capturing kan forlænge objekters levetid
    return await operation(_connection);
}
```

**Async State Machines**: Hver async metode kompileres til en state machine, der allokeres på heap'en. Disse objekter har kort levetid og frigøres typisk i Generation 0.

#### String Handling og Memory Optimization

Vores applikation skaber mange strings, især til UI formatting:

```csharp
// Inefficient string concatenation - skaber mange kortlivede objekter
public string GetTimerColor(int remainingSeconds, int totalDurationSeconds)
{
    var ratio = (double)remainingSeconds / totalDurationSeconds;
    return ratio switch
    {
        > 0.5 => "#22C55E",   // String literals - interned, ingen GC pressure
        > 0.25 => "#F59E0B", 
        _ => "#DC2626"
    };
}

// Efficient formatting using StringBuilder for complex scenarios
public async Task<string> GetExamCompletionSummaryAsync(int examId)
{
    var students = await GetStudentsForExamAsync(examId);
    // String interpolation er optimeret i moderne C#
    return $"""
        🎉 EKSAMEN AFSLUTTET
        
        📊 Status: {completedStudents.Count}/{students.Count} gennemført
        📈 Gennemsnit: {average:F1}
        """;
}
```

#### XAML Data Binding og Weak References

MAUI's data binding system bruger weak references for at undgå circular references:

```xml
<!-- Data binding skaber ikke strong references fra View til ViewModel -->
<Label Text="{Binding StudentInfo}" />
<Button Command="{Binding SaveStudentCommand}" />
```

Dette betyder at ViewModels kan garbage collectes når pages navigeres væk fra, selv om XAML binding eksisterer.

### Performance Monitoring og GC Optimization

#### Measuring GC Impact

Vi kan overvåge GC performance i vores applikation:

```csharp
public class PerformanceMonitoringService
{
    public static void LogGCInfo()
    {
        var gen0 = GC.CollectionCount(0);
        var gen1 = GC.CollectionCount(1);
        var gen2 = GC.CollectionCount(2);
        var totalMemory = GC.GetTotalMemory(false);
        
        System.Diagnostics.Debug.WriteLine($"GC Stats - Gen0: {gen0}, Gen1: {gen1}, Gen2: {gen2}, Memory: {totalMemory:N0} bytes");
    }
}
```

#### Database Connection Pooling og GC

Vores Database klasse demonstrerer optimal resource management:

```csharp
public class Database
{
    private readonly SQLiteAsyncConnection? _connection;
    
    // Singleton pattern reducerer GC pressure
    public Database()
    {
        // En connection lever gennem hele app lifetime
        _connection = new SQLiteAsyncConnection(databasePath, true);
    }
    
    // Async operations genanvender samme connection
    public async Task<List<Student>> GetStudentsAsync() => 
        await ExecuteAsync(conn => conn.Table<Student>().ToListAsync(), new List<Student>());
}
```

**GC Benefits**:
- Én connection allokering frem for many
- Reduceret pressure på Generation 0
- Mindre frequent garbage collection cycles

### Large Object Heap (LOH) Considerations

For objekter større end 85KB (f.eks. store billeder eller data collections):

```csharp
public async Task<List<Student>> GetLargeStudentDataset(int examId)
{
    // Store collections går direkte til LOH
    var largeStudentList = new List<Student>(10000);
    
    // LOH objekter frigøres kun under Generation 2 collections
    return await _dataService.GetStudentsByExamIdAsync(examId);
}
```

### Weak References og Event Handling

Timer service demonstrerer proper event cleanup:

```csharp
public class TimerService : ITimerService, IDisposable
{
    private System.Timers.Timer? _timer;
    public event EventHandler<int>? TimerTick;
    
    public void Dispose()
    {
        _timer?.Stop();
        _timer?.Dispose(); // Proper disposal prevents memory leaks
        _timer = null;
    }
}

// ViewModel implementerer IDisposable for event cleanup
public partial class ExamSessionViewModel : BaseViewModel, IDisposable
{
    public void Dispose() => _timerService.TimerTick -= OnTimerTick;
}
```

### GC Best Practices i Vores Applikation

#### 1. Object Pooling for High-Frequency Operations

```csharp
// I stedet for at skabe nye objekter konstant
public class TimerDisplayService
{
    private readonly StringBuilder _stringBuilder = new(10);
    
    public string FormatTime(int totalSeconds)
    {
        _stringBuilder.Clear();
        _stringBuilder.AppendFormat("{0:D2}:{1:D2}", totalSeconds / 60, totalSeconds % 60);
        return _stringBuilder.ToString();
    }
}
```

#### 2. Proper Collection Management

```csharp
protected static void UpdateCollectionFromList<T>(ObservableCollection<T> collection, IEnumerable<T> items)
{
    collection.Clear(); // Efficient clearing reduces GC pressure
    foreach (var item in items)
    {
        collection.Add(item);
    }
}
```

#### 3. Avoiding Premature Optimization

```csharp
// Simple, readable code er ofte bedst
public bool IsStudentCompleted(Student student) => !string.IsNullOrEmpty(student.Grade);

// I stedet for complex optimization der kan skade readability
```

### Mobile Platform Considerations

#### iOS Memory Management

iOS har aggressive memory management policies. Vores app håndterer dette gennem:

```csharp
// Lazy loading patterns reducerer memory footprint
[ObservableProperty] private List<Student>? students;

public async Task LoadStudents(int examId)
{
    // Kun load data når nødvendigt
    if (Students == null || !Students.Any())
    {
        var studentList = await _examSessionService.GetStudentsForExamAsync(examId);
        UpdateCollectionFromList(Students, studentList);
    }
}
```

#### Android Background Processing

Android kan terminere background processes aggressivt. Vores architecture håndterer dette:

```csharp
protected override async void OnAppearing()
{
    base.OnAppearing();
    // Reload data når page reappears - håndterer potential memory pressure scenarios
    await ExecuteRefreshCommand(ViewModel.LoadExamsCommand);
}
```

### Konklusion: GC's Rolle i Vores MAUI App

Garbage Collection er transparent for det meste af vores applikationskode, men påvirker performance og resource utilization betydeligt. Vores arkitektoniske valg - singleton services for langlivede objekter, transient ViewModels for ren tilstand, proper disposal patterns, og efficient string handling - skaber en applikation der arbejder harmonisk med .NET's GC system.

De vigtigste takeaways for GC i vores applikation:

1. **Service Lifetimes**: Singleton for shared resources, transient for stateful components
2. **Disposal Patterns**: Explicit cleanup for event handlers og unmanaged resources
3. **Collection Management**: Efficient updating af ObservableCollections
4. **String Optimization**: String interpolation og StringBuilder for complex scenarios
5. **Async Awareness**: Forståelse af state machine allocations
6. **Mobile Considerations**: Memory pressure handling for iOS/Android

Denne forståelse af GC hjælper os med at skrive effektiv kode, der skalerer godt og giver responsiv brugeroplevelse på tværs af alle MAUI platforme. 