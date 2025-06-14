namespace JanuarMAUI.Interfaces;

public interface IDatabaseService
{
    Task InitializeDatabaseAsync();
    Task<SQLite.SQLiteAsyncConnection> GetConnectionAsync();
} 