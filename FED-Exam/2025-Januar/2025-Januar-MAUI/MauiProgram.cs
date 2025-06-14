using Microsoft.Extensions.Logging;
using JanuarMAUI.Interfaces;
using JanuarMAUI.Repositories;
using JanuarMAUI.Services;
using JanuarMAUI.ViewModels;
using JanuarMAUI.Views;

namespace JanuarMAUI;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        // Register Services (Following Dependency Injection and SOLID principles)
        builder.Services.AddSingleton<IDatabaseService, DatabaseService>();
        builder.Services.AddSingleton<IHabitRepository, HabitRepository>();
        builder.Services.AddSingleton<IHabitEntryRepository, HabitEntryRepository>();
        builder.Services.AddSingleton<IHabitService, HabitService>();

        // Register ViewModels
        builder.Services.AddSingleton<MainViewModel>();
        builder.Services.AddTransient<AddHabitViewModel>();
        builder.Services.AddSingleton<StatisticsViewModel>();
        builder.Services.AddSingleton<SettingsViewModel>();

        // Register Views
        builder.Services.AddSingleton<MainPage>();
        builder.Services.AddTransient<AddHabitPage>();
        builder.Services.AddSingleton<StatisticsPage>();
        builder.Services.AddSingleton<SettingsPage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        var app = builder.Build();

        return app;
    }
}
