
using SQLite;

using BilvaerkstedApp.Models;

namespace BilvaerkstedApp.Data;

public class DatabaseService
{
    private SQLiteAsyncConnection _database;

        public async Task Init()
        {
            if (_database == null)
            {
                string path = Path.Combine(FileSystem.AppDataDirectory, "bilvaerksted.db");
                _database = new SQLiteAsyncConnection(path);
                await _database.CreateTableAsync<Opgave>();
            }
        }

        public async Task<List<Opgave>> GetOpgaverByDate(DateTime date)
        {
            await Init();
            return await _database.Table<Opgave>().Where(x => x.DatoTid.Date == date.Date).ToListAsync();
        }

        public async Task<int> SaveOpgave(Opgave opgave)
        {
            await Init();
            return await _database.InsertAsync(opgave);
        }

        
}