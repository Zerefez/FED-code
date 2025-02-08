using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BilvaerkstedApp.Models;
using BilvaerkstedApp.Services;
using System.Collections.ObjectModel;

namespace BilvaerkstedApp.ViewModels
{
    public partial class OpgaveOversigtViewModel : ObservableObject
    {

        public OpgaveOversigtViewModel() {  }
        private readonly DatabaseService _databaseService;

        [ObservableProperty]
        private DateTime selectedDate = DateTime.Today;

        [ObservableProperty]
        private ObservableCollection<Opgave> opgaver = new();

        public OpgaveOversigtViewModel(DatabaseService databaseService)
        {
            _databaseService = databaseService;
            LoadOpgaverCommand = new AsyncRelayCommand(LoadOpgaver);
        }

        public IAsyncRelayCommand LoadOpgaverCommand { get; }

        private async Task LoadOpgaver()
        {
            var fetchedOpgaver = await _databaseService.GetOpgaverByDate(SelectedDate);
            Opgaver = new ObservableCollection<Opgave>(fetchedOpgaver);
        }
    }
}
