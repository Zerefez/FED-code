
using BilvaerkstedApp.Models;
using BilvaerkstedApp.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;


namespace BilvaerkstedApp.ViewModels;

public partial class BookOpgaveViewModel : ObservableObject
{
    public  BookOpgaveViewModel() { }
    private readonly DatabaseService _databaseService;

    [ObservableProperty]
    private string kundeNavn;

    [ObservableProperty]
    private string adresse;

    [ObservableProperty]
    private string bilMaerke;

    [ObservableProperty]
    private string model;

    [ObservableProperty]
    private string indregistreringsnummer;

    [ObservableProperty]
    private DateTime datoTid = DateTime.Now;

    [ObservableProperty]
    private string arbejde;

    public BookOpgaveViewModel(DatabaseService databaseService)
    {
        _databaseService = databaseService;
    }

    [RelayCommand]
    public async Task GemOpgave()
    {
        var opgave = new Opgave
        {
            KundeNavn = KundeNavn,
            Adresse = Adresse,
            BilMaerke = BilMaerke,
            Model = Model,
            Indregistreringsnummer = Indregistreringsnummer,
            DatoTid = DatoTid,
            Arbejde = Arbejde
        };

        await _databaseService.SaveOpgave(opgave);
        await Shell.Current.DisplayAlert("Success", "Opgaven er gemt!", "OK");
    }
}