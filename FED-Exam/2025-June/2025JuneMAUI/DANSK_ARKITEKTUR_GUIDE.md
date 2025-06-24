# .NET MAUI Arkitektur Guide

## .NET Framework og Arkitektur

.NET frameworket leverer en tværplatforms udviklingsplatform baseret på Common Language Runtime (CLR). CLR gør det muligt for flere programmeringssprog at kompilere til fælles mellemsprog (IL) og sikrer konsistent adfærd på tværs af platforme.

Vores eksamenssystem bruger .NET 9 og demonstrerer multi-targeting gennem `2025JuneMAUI.csproj`. Projektfilen viser hvordan vi målretter flere platforme med én kodebase og bruger betinget kompilering til Windows-specifikke funktioner. .NET's Base Class Library giver konsistent API på tværs af platforme.

Frameworket implementerer tre grundprincipper. Managed memory management automatiserer hukommelsesstyring gennem garbage collection, som vi ser i databaseoperationer hvor forbindelser automatisk disponeres. Det stærke typesystem forhindrer runtime-fejl gennem kompileringstidsvalidering, hvilket vores `Student.cs` og `Exam.cs` modeller demonstrerer. Exception handling-mekanismer giver elegant fejlhåndtering, implementeret i `BaseViewModel.ExecuteAsync`.

.NET runtime består af lag der arbejder sammen. CLR administrerer hukommelse, garbage collection, tråde og sikkerhed. Base Class Library leverer grundtyper, mens framework-biblioteker som MAUI udvider funktionalitet. Vores applikation bruger MAUI's abstraktion over platformspecifikke UI-frameworks for "skriv én gang, kør overalt" med native performance.

## C# Programmeringssprog

C# er vores primære programmeringssprog og kombinerer objektorienterede principper med moderne sprogfunktioner. Sproget prioriterer typesikkerhed, performance og læsbarhed.

Vores applikation viser C#'s objektorienterede kapabiliteter gennem klassehierarkier. `BaseViewModel` demonstrerer arv og polymorfisme og giver fælles funktionalitet til afledte ViewModels. Klassen bruger C#'s egenskabssystem med automatisk generering gennem source generators via `[ObservableProperty]` attributter.

Asynkron programmering med `async` og `await` sikrer applikationens responsivitet. Databaseoperationer i `Database.cs` viser hvordan C# muliggør ikke-blokerende operationer der bevarer UI-responsivitet. `ExecuteAsync` mønsteret viser elegant komposition af asynkrone operationer med fejlhåndtering.

C#'s generiske typesystem giver typesikkerhed og kodegenbrug. `ExecuteAsync<T>` metoden demonstrerer typesikre operationer på tværs af datatyper med én implementering. LINQ transformerer dataforespørgsler til deklarative operationer gennem metodekædning og lambda-udtryk.

Egenskabssystemet muliggør sofistikerede databinding-scenarier. Vores ViewModels bruger auto-implementerede egenskaber, expression-bodied medlemmer og partielle metoder. Nullable reference types hjælper med at forhindre null reference exceptions ved kompileringstid.

Moderne C# funktioner forbedrer udtryksevne. Pattern matching giver kortfattet tilstandslogik, string interpolation leverer læselig strengformatering, og record typer giver immutable datastrukturer.

## GUI Konstruktion

.NET MAUI bruger deklarativ XAML til visuel struktur og C# code-behind til adfærd. Vores applikation demonstrerer layout-komposition gennem hierarkisk arrangement af paneler og kontroller.

Layout-paneler giver fleksible containers til organisering af elementer. `MainPage.xaml` bruger `ScrollView` med `VerticalStackLayout` for automatisk scrolling når indhold overstiger skærmplads. Dette sikrer tilgængelighed på tværs af enheder med forskellige skærmstørrelser.

Layout-systemet bruger måle-og-arrangere tilgang hvor paneler beregner børns pladsbehov før positionering. `StackLayout` arrangerer børn lineært med konfigurerbar afstand. `Spacing` skaber visuel rytme, `Padding` giver åndeplads.

Formular-layouts kombinerer `Grid` til struktureret data og `StackLayout` til lineær organisation. `Grid` muliggør komplekse arrangementer med faste, auto-størrende eller proportionale dimensioner.

Kontrolvalg prioriterer funktionalitet og konsistens. `Entry` tilpasser sig platformspecifik input-adfærd, `Button` giver platformpassende styling, `Picker` abstraherer udvælgelsesmekanismer til unified API.

Styling-systemet bruger XAML-ressourcer til konsistent design. Globale styles giver typografi-, farve- og afstandsstandarder automatisk, men tillader specifikke tilpasninger.

## Side Navigation

.NET MAUI bruger Shell-baseret arkitektur for unified navigation på tværs af platforme. Vores system implementerer navigation gennem AppShell-konfiguration.

`AppShell.xaml` etablerer navigationsstruktur gennem `TabBar` med konsistent adgang til hovedfunktioner. Hvert `ShellContent` definerer rute og sidetype for både deklarativ og programmatisk navigation.

Navigation bruger Shell's routing-kapabiliteter til deep linking. MainPage demonstrerer `Shell.Current.GoToAsync()` med absolutte rute-stier for konsistent adfærd uanset placering i hierarkiet.

Dobbelt-skråstreg indikerer absolut navigation der nulstiller navigationsstakken. Routing understøtter parametre, men vores applikation bruger primært dependency injection til datadeling.

Side livscyklus integreres med navigation gennem override-metoder i base klasser. `BaseContentPage<TViewModel>` viser hvordan sider kan initialisere når de vises, så ViewModels kan opdatere data.

Dependency injection muliggør sofistikeret sidekonstruktion hvor sider modtager ViewModels og services gennem constructor injection. `ContentTemplate` tillader lazy loading for optimeret hukommelsesforbrug.

## Dependency Injection og Host Builder

Dependency injection danner arkitektonisk fundament og muliggør løs kobling med sofistikeret service lifetime-styring. Implementeringen følger host builder-mønsteret.

`MauiProgram.cs` demonstrerer service-registrering med passende levetider. Builder-mønsteret muliggør fluent konfiguration mens DI-containeren administrerer instantiering automatisk.

Singleton-registrering for `Database` sikrer én databaseforbindelse gennem applikationens levetid for optimal performance. Asynkron initialisering forhindrer blokering af app-start.

Transient ViewModels sikrer frisk instans med ren tilstand ved hver navigation. Dette forhindrer dataforurening mellem brugersessioner og stemmer overens med MAUI's side livscyklus.

Interface-baseret registrering muliggør testing og udvidelighed. `IExamService` og `IStudentService` definerer kontrakter som ViewModels afhænger af, mens implementeringer håndterer forretningslogik.

Constructor injection løser afhængigheder automatisk og eliminerer service location-mønstre. ViewModels injiceres med nødvendige services som readonly fields for eksplicitte afhængigheder.

## MVVM Arkitektur

Model-View-ViewModel implementerer separation of concerns for vedligeholdelig, testbar udvikling. Mønsteret bruger C#'s typesystem og XAML's databinding for reaktive brugergrænseflader.

ViewModels bruger CommunityToolkit.Mvvm for source-genererede MVVM-mønstre. `BaseViewModel` demonstrerer hvordan source generators skaber observable egenskaber og relay-kommandoer ved kompileringstid.

Model-laget består af dataentiteter med minimal adfærd ud over datalagring. `Student`, `Exam` og `ExamSession` inkluderer dataannotationer til persistering men fokuserer på datarepræsentation.

ViewModel implementering viser sofistikeret tilstandsstyring. `ExamSessionViewModel` demonstrerer hvordan boolean egenskaber kontrollerer UI-synlighed baseret på workflow-fase for deklarativ UI-adfærd.

`[RelayCommand]` attributter giver typesikker event handling med adskillelse mellem UI-events og forretningslogik. Kommandoer håndterer async mønstre og `CanExecute` funktionalitet automatisk.

Databinding skaber reaktive forbindelser mellem UI og ViewModel-egenskaber. Binding-systemet understøtter one-way, two-way og one-time modi for optimeret performance. Property change notifications udløser automatisk UI-opdateringer.

`ObservableCollection<T>` giver automatiske UI-opdateringer når samlingsindhold ændres for dynamiske liste-interfaces der reflekterer realtids datamodifikationer.

## Database Adgang

Dataadgang bruger lagdelt arkitektur der adskiller persistens fra forretningslogik. Implementeringen demonstrerer asynkrone mønstre for UI-responsivitet.

SQLite gennem sqlite-net-pcl giver tværplatforms ORM-løsning. `Database.cs` demonstrerer forbindelsesstyring og initialiseringsmønstre med elegant fejlhåndtering.

Asynkron initialisering forhindrer blokering af app-start mens tabeller oprettes. Initialiseringsopgave-mønsteret giver trådsikker adgang uden eksplicitte synkroniseringsprimitiver.

`ExecuteAsync<T>` wrapper giver konsistente mønstre på tværs af operationstyper med standardværdier for fejlscenarier og forbindelsesvalidering.

ORM bruger LINQ-udtryk for typesikker forespørgselskomposition der oversættes til effektive SQL-operationer. SQLite query optimizer håndterer eksekveringsplanlægning automatisk.

Transaktionsstyring sikrer datakonsistens for komplekse operationer. Kaskaderende sletning demonstrerer manuel transaktionsstyring for referentiel integritet.

`IDataService` abstraktionen adskiller database-detaljer fra forretningslogik og muliggør fremtidig migration til andre teknologier. Async/await mønstre understøtter naturligt netværksoperationer for potentiel remote data integration. 