using SQLite;

namespace BilvaerkstedApp.Models;

public class Opgave
{
    [PrimaryKey, AutoIncrement]
        public int Id { get; set; }
        public string KundeNavn { get; set; }
        public string Adresse { get; set; }
        public string BilMaerke { get; set; }
        public string Model { get; set; }
        public string Indregistreringsnummer { get; set; }
        public DateTime DatoTid { get; set; }
        public string Arbejde { get; set; }
}