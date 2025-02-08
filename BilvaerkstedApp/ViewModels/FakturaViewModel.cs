using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BilvaerkstedApp.Models;
using System.Collections.ObjectModel;

namespace BilvaerkstedApp.ViewModels
{
    public partial class FakturaViewModel : ObservableObject
    {
        [ObservableProperty]
        private string mekanikerNavn;

        [ObservableProperty]
        private ObservableCollection<(string Materiale, decimal Pris)> materialer = new();

        [ObservableProperty]
        private int timer;

        [ObservableProperty]
        private decimal timePris;

        [ObservableProperty]
        private decimal totalPris;

        public FakturaViewModel()
        {
            BeregnTotalPrisCommand = new RelayCommand(BeregnTotalPris);
        }

        public IRelayCommand BeregnTotalPrisCommand { get; }

        private void BeregnTotalPris()
        {
            decimal materialPris = Materialer.Sum(m => m.Pris);
            decimal arbejdsPris = Timer * TimePris;
            TotalPris = materialPris + arbejdsPris;
        }

        [ObservableProperty]
        private string materialeNavn;

        [ObservableProperty]
        private decimal materialePris;

        [RelayCommand]
        public void TilføjMateriale()
        {
            Materialer.Add((MaterialeNavn, MaterialePris));
            BeregnTotalPris();
        }
    }
}
