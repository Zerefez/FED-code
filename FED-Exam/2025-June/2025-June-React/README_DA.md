# Eksamenadministrationssystem - Teknisk Dokumentation

## Indholdsfortegnelse
1. [Projektoversigt & Koncept](#projektoversigt--koncept)
2. [Arkitektur & Designfilosofi](#arkitektur--designfilosofi)
3. [Projektstruktur & Organisation](#projektstruktur--organisation)
4. [Komponentarkitektur & Designmønstre](#komponentarkitektur--designmønstre)
5. [Routing-strategi](#routing-strategi)
6. [State Management & React Hooks](#state-management--react-hooks)
7. [API-design & Dataflow](#api-design--dataflow)
8. [Styling-strategi](#styling-strategi)
9. [Udviklingsværktøjer](#udviklingsværktøjer)
10. [Fordele & Ulemper Analyse](#fordele--ulemper-analyse)

## Projektoversigt & Koncept

Denne React-applikation er et omfattende eksamenadministrationssystem designet specifikt til at administrere mundtlige eksamener på uddannelsesinstitutioner. Systemet håndterer det komplekse workflow af at gennemføre mundtlige eksamener, som involverer flere sekventielle trin: eksamenoprettelse, studenterregistrering, spørgsmålstrækning, tidsregistrering, notetagning og karaktergivning.

### Kerneproblemstilling

Traditionel mundtlig eksamenadministration bygger ofte på manuelle processer, der er tilbøjelige til menneskelige fejl, mangler standardisering og giver dårlige revisionsspor. Eksaminatorer skal typisk jonglere med flere ansvarsområder samtidigt: tidsstyring, notetagning, sikring af fair spørgsmålsfordeling og opretholdelse af konsekvente karakterstandarder. Dette skaber kognitiv overhead, der kan distrahere fra det primære fokus på at evaluere studenterens præstation.

### Løsningsarkitektur

Applikationen løser disse problemer gennem et systematisk digitalt workflow, der håndhæver konsekvente processer, mens den tilbyder automatiseret assistance til tidsregistrering og dataindsamling. Systemet er bygget som en Single Page Application (SPA) ved hjælp af React og tilbyder et responsivt interface, der fungerer problemfrit på tværs af forskellige enheder og skærmstørrelser.

Løsningen anvender en state-drevet arkitektur, hvor hver eksamenssession skrider frem gennem klart definerede stadier:

1. **Eksamenopsætningsfase**: Oprettelse af eksamensparametre og registrering af studerende
2. **Eksaminationsfase**: Gennemførelse af individuelle studentervurderinger med automatiseret timing
3. **Evalueringsfase**: Registrering af karakterer og noter med struktureret datafangst
4. **Gennemgangsfase**: Adgang til historiske data og generering af indsigter

### Tekniske Krav & Begrænsninger

Systemet er designet til at fungere i uddannelsesmiljøer, hvor internetforbindelse kan være intermitterende, men hvor datapersistens og nøjagtighed er kritisk. Dette påvirkede flere arkitektoniske beslutninger:

- **Client-side state management** for at reducere afhængighed af konstant serverforbindelse
- **RESTful API-design** for simpel, pålidelig datasynkronisering
- **Komponentbaseret arkitektur** for vedligeholdelse og test
- **Responsivt design** til at understøtte forskellige enheder brugt i akademiske miljøer

## Arkitektur & Designfilosofi

### Arkitektoniske Principper

Applikationen følger flere centrale arkitektoniske principper, der styrer alle designbeslutninger:

#### 1. Adskillelse af Bekymringer

Kodebasen opretholder klare grænser mellem forskellige typer funktionalitet. Forretningslogik adskilles fra præsentationslogik, dataadgang abstraheres fra komponentlogik, og routing-bekymringer isoleres fra komponentimplementering. Denne adskillelse muliggør uafhængig testning, lettere vedligeholdelse og bedre kodegenbrug.

```typescript
// Eksempel: Klar adskillelse mellem datalogik og præsentation
// Data hook (forretningslogik)
export function useExamData(examId: string | undefined): UseExamDataReturn {
  const { items: allExams, loading: examsLoading } = useExams();
  const [exam, setExam] = useState<Exam | null>(null);
  // ... data management logik
}

// Komponent (præsentationslogik)
export function ExamOverview() {
  const { exam, students } = useExamContext(); // Ren dataforbrug
  // ... ren præsentationslogik
}
```

#### 2. Komposition Over Arv

Reacts komponentmodel opfordrer naturligt til komposition, og denne applikation udnytter dette princip extensively. Komplekse interfaces bygges ved at komponere mindre, fokuserede komponenter snarere end at skabe store, monolitiske komponenter. Denne tilgang forbedrer testbarhed, genanvendelighed og kognitiv belastning under debugging.

```typescript
// Eksempel: ExamSession komponeret af fokuserede subkomponenter
export function ExamSession() {
  return (
    <div className="space-y-6">
      <StudentInfoCard student={currentStudent} />
      {examState === 'waiting' && <QuestionDrawingCard />}
      {drawnQuestion && <QuestionResultCard />}
      {examState === 'in-progress' && <TimerControlsCard />}
      <NotesCard />
      {examState === 'finished' && <GradingCard />}
    </div>
  );
}
```

#### 3. Forudsigelig State Management

Applikationen anvender forudsigelige state management-mønstre, hvor state-ændringer flyder i én retning og udløses af eksplicitte handlinger. Dette gør applikationens opførsel mere forudsigelig og lettere at debugge, hvilket er særligt vigtigt i et eksamensmiljø, hvor pålidelighed er afgørende.

#### 4. Progressiv Forbedring

Interfacet er designet til at fungere med grundlæggende funktionalitet, selv når avancerede funktioner fejler. For eksempel, hvis lydnotifikationer fejler, giver visuelle indikatorer stadig timingoplysninger. Hvis local storage fejler, fortsætter applikationen med at fungere med session-only state management.

### Designmønster-implementering

#### Context Provider Mønster

Applikationen bruger Reacts Context API til at administrere delt state på tværs af komponenttræer uden prop drilling. Dette mønster er særligt effektivt for eksamendata, der skal tilgås af flere komponenter på forskellige indlejringsniveauer.

```typescript
// Context definition med klar type safety
interface ExamContextType {
  exam: Exam | null;
  students: Student[];
  isLoading: boolean;
  handleStudentAdded: (student: Student) => void;
  handleStudentUpdate: (student: Student) => void;
}

// Provider implementering med komplet data management
export function ExamProvider({ children, examId }: ExamProviderProps) {
  const examData = useExamData(examId);
  return (
    <ExamContext.Provider value={examData}>
      {children}
    </ExamContext.Provider>
  );
}
```

Dette mønster giver flere fordele:
- **Eliminerer prop drilling** gennem dybe komponenthierarkier
- **Centraliserer state management** for relaterede data
- **Giver type safety** gennem TypeScript interfaces
- **Muliggør nem testning** ved at mocke context værdier

#### Custom Hook Mønster

Kompleks stateful logik indkapsles i custom hooks, der giver rene API'er til komponenter. Dette mønster fremmer genanvendelighed og gør kompleks state management logik testbar i isolation.

```typescript
// Custom hook der indkapsler timer logik
export function useExamTimer(initialDurationMinutes: number): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  const startTimer = () => {
    // Kompleks timer logik indkapslet
  };
  
  return { timeRemaining, isRunning, startTimer, stopTimer, resetTimer };
}
```

#### Repository Mønster for Dataadgang

Dataadgang abstraheres gennem servicelag, der giver konsekvente API'er uanset den underliggende datakilde. Dette mønster muliggør nem testning og potentiel fremtidig migration til forskellige backend-systemer.

```typescript
// Service interface der giver abstraktion
export const examService = {
  createExam: async (examData: CreateExamData): Promise<Exam> => {
    return apiClient.post<Exam>('/exams', examData);
  },
  getExams: async (): Promise<Exam[]> => {
    return apiClient.get<Exam[]>('/exams');
  },
  // ... andre operationer
};

## Projektstruktur & Organisation

Projektstrukturen følger en feature-baseret organisation med klar adskillelse mellem forskellige typer kode. Denne struktur blev valgt for at optimere vedligeholdelse, teamsamarbejde og logisk kodeorganisation.

### Mappestruktur Begrundelse

```
src/
├── components/          # Genanvendelige UI-komponenter
│   ├── exam/           # Domænespecifikke komponenter
│   ├── layout/         # Layout og navigationskomponenter
│   ├── ui/             # Generiske UI-primitiver
│   └── router/         # Routing konfiguration
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Side-niveau komponenter
├── services/           # Eksterne API-services
├── types/              # TypeScript type definitioner
├── lib/                # Hjælpefunktioner
└── router/             # Applikationsrouting
```

#### Components Mappeorganisation

Components-mappen er organiseret efter domæne og abstraktionsniveau, hvilket skaber klare grænser mellem forskellige typer komponenter:

**Domænespecifikke Komponenter (`components/exam/`)**
Disse komponenter indeholder forretningslogik specifik for eksamenadministration. De forstår eksamensdomænemodellen og implementerer specifikke workflows:

```typescript
// Eksempel: ExamSession komponent forstår eksamen workflow
export function ExamSession() {
  const [examState, setExamState] = useState<ExamState>('waiting');
  const [drawnQuestion, setDrawnQuestion] = useState<number | null>(null);
  
  // Håndterer eksamensspecifikke state overgange
  const handleDrawQuestion = () => {
    const questionNumber = drawRandomQuestion(exam.numberOfQuestions);
    setDrawnQuestion(questionNumber);
    setExamState('question-drawn');
  };
}
```

**Generiske UI Komponenter (`components/ui/`)**
Disse er rene præsentationskomponenter uden forretningslogik. De giver konsistent styling og opførsel på tværs af applikationen:

```typescript
// Eksempel: Button komponent uden forretningslogik
export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

Denne adskillelse giver flere fordele:
- **Forretningslogik isolation** gør domænekomponenter lettere at teste
- **Design system konsistens** gennem genanvendelige UI primitiver
- **Teamsamarbejde** ved at tillade UI og forretningslogik udvikling parallelt
- **Kode genanvendelighed** på tværs af forskellige dele af applikationen

#### Service Lag Arkitektur

Services-mappen implementerer en ren adskillelse mellem applikationen og eksterne afhængigheder. Hver service giver et konsistent API, der abstraherer de underliggende implementeringsdetaljer:

```typescript
// Generisk API klient til HTTP operationer
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    return request<T>(endpoint, { method: 'GET', params });
  },
  post: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'POST', body: data });
  },
  // ... andre HTTP metoder
};

// Domænespecifik service der bruger den generiske klient
export const examService = {
  createExam: async (examData: CreateExamData): Promise<Exam> => {
    return apiClient.post<Exam>('/exams', examData);
  },
  // ... andre eksamen operationer
};
```

Denne lagdelte tilgang giver:
- **Teknologi uafhængighed** ved at abstraherede HTTP implementeringsdetaljer
- **Fejlhåndtering konsistens** på tværs af alle API operationer
- **Test simplicitet** gennem nem mocking af servicelag
- **Fremtidig fleksibilitet** for ændring af backend implementeringer

#### Type System Organisation

TypeScript types er centraliseret i `types/`-mappen og giver en enkelt kilde til sandhed for datamodeller gennem hele applikationen:

```typescript
// Kerndomæne typer
export interface Exam {
  id: string;
  examtermin: string;
  courseName: string;
  date: string;
  numberOfQuestions: number;
  examDurationMinutes: number;
  startTime: string;
}

export interface Student {
  id: string;
  exam: string;
  studenNo: string;
  firstName: string;
  lastName: string;
  questionNo?: number;
  examDurationMinutes?: number;
  notes?: string;
  grade?: string;
}
```

Centralisering af typer giver:
- **Konsistens** på tværs af alle komponenter, der bruger de samme datastrukturer
- **Refaktorering sikkerhed** gennem TypeScripts type checking
- **Dokumentation** af applikationens datamodel
- **IDE support** med autocomplete og fejldetektion

## Komponentarkitektur & Designmønstre

### Komponenthierarki og Komposition

Applikationens komponentarkitektur følger en hierarkisk struktur, hvor komplekse interfaces komponeres af mindre, fokuserede komponenter. Denne tilgang stemmer overens med Reacts komponentmodel og giver flere arkitektoniske fordele.

#### Side-niveau Komponenter

Sidekomponenter fungerer som top-niveau orkestratorer for specifikke applikationsruter. De håndterer routing-bekymringer, context provision og koordinerer mellem flere feature-komponenter:

```typescript
// StartExamPage orkestrerer flere contexts og håndterer routing
export function StartExamPage() {
  const { examId } = useParams<{ examId: string }>();

  if (!examId) {
    return <ExamSelection />;
  }

  return (
    <ExamProvider examId={examId}>
      <ExamSessionProvider>
        <StartExamContent />
      </ExamSessionProvider>
    </ExamProvider>
  );
}
```

Dette mønster giver:
- **Klare ansvarsgrrænser** mellem routing og forretningslogik
- **Context isolation** der forhindrer unødvendige re-renders
- **Testbarhed** gennem dependency injection via props
- **Route-specifik optimering** gennem lazy loading potentiale

#### Feature Komponenter

Feature komponenter implementerer specifikke forretningsworkflows og indeholder domæneviden. De koordinerer mellem flere UI komponenter og administrerer komplekse state overgange:

```typescript
// ExamSession administrerer det komplekse eksamen workflow
export function ExamSession() {
  const [examState, setExamState] = useState<ExamState>('waiting');
  const { timeRemaining, startTimer, stopTimer } = useExamTimer(exam.examDurationMinutes);
  
  // Koordinerer flere subkomponenter baseret på eksamen state
  return (
    <div className="space-y-6">
      {examState === 'waiting' && (
        <QuestionDrawingCard onDrawQuestion={handleDrawQuestion} />
      )}
      {examState === 'in-progress' && (
        <TimerControlsCard 
          timeRemaining={timeRemaining}
          onStopExamination={handleStopExamination}
        />
      )}
    </div>
  );
}
```

#### UI Primitiv Komponenter

UI primitiver giver konsistent styling og opførsel uden at indeholde forretningslogik. De implementerer designsystemet og sikrer visuel konsistens:

```typescript
// Card komponent giver konsistent layout og styling
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}  
    />
  );
}
```

### State Management Mønstre

#### Lokal State for Komponentspecifikke Data

Komponenter bruger lokal state for data, der ikke behøver at blive delt med andre komponenter. Dette holder komponent API'er rene og undgår unødvendig kobling:

```typescript
export function StudentForm() {
  const [formData, setFormData] = useState<StudentFormState>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Lokal state management for formularspecifikke bekymringer
  const updateStudent = (index: number, field: keyof CreateStudentData, value: string) => {
    const newStudents = formData.students.map((student, i) => 
      i === index ? { ...student, [field]: value } : student
    );
    setFormData({ students: newStudents });
  };
}
```

#### Context for Delt Domæne State

Relaterede data, der skal tilgås af flere komponenter, administreres gennem Context API'er. Dette giver en ren måde at dele state uden prop drilling:

```typescript
// ExamContext giver eksamenrelaterede data til indlejrede komponenter
export function ExamProvider({ children, examId }: ExamProviderProps) {
  const {
    exam,
    students,
    handleStudentAdded,
    handleStudentUpdate
  } = useExamData(examId);

  return (
    <ExamContext.Provider value={{
      exam,
      students,
      handleStudentAdded,
      handleStudentUpdate
    }}>
      {children}
    </ExamContext.Provider>
  );
}

#### Custom Hooks for Kompleks State Logik

Kompleks stateful opførsel indkapsles i custom hooks, der giver rene API'er og kan testes uafhængigt:

```typescript
// useExamTimer indkapsler timer logik med flere koordinerede state variabler
export function useExamTimer(initialDurationMinutes: number): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialDurationMinutes * 60);
  const [actualExamTime, setActualExamTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerIntervalRef.current) return;
    
    setIsRunning(true);
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        setActualExamTime(prevActual => prevActual + 1);
        
        if (newTime <= 0) {
          playTimerSound();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    timerIntervalRef.current = interval;
  };

  // Cleanup og andre timer operationer...
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return { timeRemaining, actualExamTime, isRunning, startTimer, stopTimer, resetTimer };
}
```

Dette hook demonstrerer flere vigtige mønstre:
- **Indkapsling** af relaterede state variabler
- **Side effect management** gennem useEffect
- **Resource cleanup** for at forhindre memory leaks
- **Pure function interface** for nem testning

## Konklusion

Dette React-baserede eksamenadministrationssystem demonstrerer en velarkitekteret løsning til administration af mundtlige eksamener i uddannelsesmiljøer. Applikationen balancerer succesfuldt moderne udviklingspraksis med praktiske begrænsninger, hvilket resulterer i et vedligeholdeligt og brugervenligt system.

Arkitekturen prioriterer udvikleroplevelse gennem TypeScript integration, komponentbaseret design og moderne værktøjer, samtidig med at den opretholder enkelhed og pålidelighed. Brugen af Reacts indbyggede state management-muligheder, kombineret med custom hooks og context providers, skaber et skalerbart fundament, der kan vokse med udviklende krav.

Teknologistakken afspejler en pragmatisk tilgang til softwareudvikling og favoriserer beviste teknologier og mønstre frem for banebrydende, men utestede løsninger. Denne tilgang sikrer langsigtet vedligeholdelse, samtidig med at den giver en fremragende udvikleroplevelse.

Vigtige arkitektoniske styrker inkluderer klar adskillelse af bekymringer, omfattende type safety, intuitive brugergrænseflader og robust fejlhåndtering. Systemet løser succesfuldt kerneproblemerne ved eksamenadministration, samtidig med at det giver et fundament for fremtidige forbedringer og skalering.

For organisationer, der søger at modernisere deres eksamenprocesser, giver denne arkitektur et solidt fundament, der balancerer funktionalitet, vedligeholdelse og brugeroplevelse. Det modulære design og klare arkitektoniske grænser gør det velegnet til teams af forskellige størrelser og erfaringsniveauer, mens den omfattende dokumentation og type safety funktioner reducerer indlæringskurven for nye udviklere, der slutter sig til projektet.
```
``` 