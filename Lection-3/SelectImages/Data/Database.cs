using SelectImages.Models;
using SQLite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SelectImages.Data
{
    internal class Database
    {
        private readonly SQLiteAsyncConnection _connection;
        public Database()
        {
            var dataDir = FileSystem.AppDataDirectory;
            var databasePath = Path.Combine(dataDir, "ImageCarousel.db");
            var dbOptions = new SQLiteConnectionString(databasePath, true);
            _connection = new SQLiteAsyncConnection(dbOptions);
            _ = Initialise();
        }
        private async Task Initialise()
        {
            await _connection.CreateTableAsync<ImageInfo>();
        }
        public async Task<List<ImageInfo>> GetImageInfos()
        {
            return await _connection.Table<ImageInfo>().ToListAsync();

        }

        public async Task<ImageInfo> GetImageInfo(int id)
        {
            var query = _connection.Table<ImageInfo>().Where(t => t.Id == id);
            return await query.FirstOrDefaultAsync();
        }
        public async Task<int> AddImageInfo(ImageInfo item)
        {
            return await _connection.InsertAsync(item);
        }
        public async Task<int> DeleteImageInfo(ImageInfo item)
        {
            return await _connection.DeleteAsync(item);
        }
        public async Task<int> UpdateImageInfo(ImageInfo item)
        {
            return await _connection.UpdateAsync(item);
        }

    }
}