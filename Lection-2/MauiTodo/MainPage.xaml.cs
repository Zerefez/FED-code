

using MauiTodo.Models;

namespace MauiTodo
{
	public partial class MainPage : ContentPage
	{
		string _todoListData = string.Empty; // Values of the to-do items
		readonly Database _database; // Stores an instance of the database class

		public MainPage(Database database)
		{
			InitializeComponent();
			_database = new Database(); //create an instance of the database class & assign it to the _database field.
			_ = Initialize(); //Uses the discard variable to call our Initialize method
		}

		private async Task Initialize()
		{
			// Initialization logic here
			await Task.CompletedTask;
		}

		private async void Button_Clicked(object sender, EventArgs e)
		{
			// Button click logic here

			// Create a new TodoItem object
			var todoItem = new TodoItem
			{
				Title = _todoListData,
				Done = false,
				Due = DateTime.Now,
			};

			todoItem.Id = await _database.Addtodo(todoItem); // Add the new TodoItem to the database
			_todoListData = string.Empty; // Clear the _todoListData field
			await Initialize(); // Reinitialize the page
		}
	}

}


