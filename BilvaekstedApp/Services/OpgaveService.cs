using BilvaerkstedApp.Models;
using BilvaerkstedApp.Data;

namespace BilvaerkstedApp.Services;

public class OpgaveService
{
     private readonly DatabaseService _databaseService;

        public OpgaveService(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        public async Task<List<Opgave>> HentOpgaverForDato(DateTime dato)
        {
            return await _databaseService.GetOpgaverByDate(dato);
        }
}