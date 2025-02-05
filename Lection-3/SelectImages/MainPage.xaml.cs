
using SelectImages.Data;
using SelectImages.Models;
using System.Collections.ObjectModel;

namespace SelectImages;

public partial class MainPage : ContentPage
{
		public ObservableCollection<ImageInfo> Images { get; set; } = new();
        private string _imagePath = "";
        readonly Database _database;

        public MainPage()
        {
            InitializeComponent();
            BindingContext = this;
            _database = new Database();
            _ = Initialise();
        }

        private async Task Initialise()
        {
            var imageInfos = await _database.GetImageInfos();

            foreach (var image in imageInfos)
            {
                Images.Add(image);
            }
        }

        private async void OnSelectImageClicked(object sender, EventArgs e)
        {
            var image = await FilePicker.Default.PickAsync(new PickOptions
            {
                PickerTitle = "Pick Image",
                FileTypes = FilePickerFileType.Images
            });
            if (image != null)
            {
                _imagePath = image.FullPath.ToString();
                selectedImage.Source = _imagePath;
            }
        }

        private async void OnUploadClicked(object sender, EventArgs e)
        {
            var imgi = new ImageInfo
            {
                Title = TitleEntry.Text,
                Description = DescriptionEditor.Text,
                Path = _imagePath
            };

            var inserted = await _database.AddImageInfo(imgi);

            if (inserted != 0)
            {
                Images.Add(imgi);

                TitleEntry.Text = String.Empty;
                DescriptionEditor.Text = String.Empty;
                _imagePath = string.Empty;
                selectedImage.Source = _imagePath;
            }
        }

	
}

