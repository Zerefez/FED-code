using JanuarMAUI.Interfaces;
using JanuarMAUI.Models;
using SQLite;

namespace JanuarMAUI.Repositories;

public class DatabaseService : IDatabaseService
{
    private SQLiteAsyncConnection? _database;
    private readonly string _databasePath;

    public DatabaseService()
    {
        _databasePath = Path.Combine(FileSystem.AppDataDirectory, "HabitTracker.db3");
    }

    public async Task InitializeDatabaseAsync()
    {
        try
        {
            if (_database is not null)
            {
                System.Diagnostics.Debug.WriteLine("Database already initialized, checking connection...");
                // Test the connection by doing a simple query
                var testCount = await _database.Table<Habit>().CountAsync();
                System.Diagnostics.Debug.WriteLine($"Database connection verified. Current habits count: {testCount}");
                return;
            }

            System.Diagnostics.Debug.WriteLine($"Initializing database at: {_databasePath}");
            
            // Ensure the directory exists
            var directory = Path.GetDirectoryName(_databasePath)!;
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
                System.Diagnostics.Debug.WriteLine($"Created directory: {directory}");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"Directory already exists: {directory}");
            }
            
            // Check if database file already exists
            var fileExists = File.Exists(_databasePath);
            System.Diagnostics.Debug.WriteLine($"Database file exists: {fileExists}");
            
            _database = new SQLiteAsyncConnection(_databasePath);
            
            await _database.CreateTableAsync<Habit>();
            await _database.CreateTableAsync<HabitEntry>();
            
            // Check if tables were created successfully
            var habitsCount = await _database.Table<Habit>().CountAsync();
            var entriesCount = await _database.Table<HabitEntry>().CountAsync();
            
            System.Diagnostics.Debug.WriteLine($"Database initialized successfully. Habits: {habitsCount}, Entries: {entriesCount}");
            
            // If this is a fresh database, add some test data
            if (habitsCount == 0)
            {
                System.Diagnostics.Debug.WriteLine("No habits found, this appears to be a fresh database");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error initializing database: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<SQLiteAsyncConnection> GetConnectionAsync()
    {
        await InitializeDatabaseAsync();
        return _database!;
    }
} 