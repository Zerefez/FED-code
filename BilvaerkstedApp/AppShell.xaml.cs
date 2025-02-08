

using BilvaerkstedApp.Views;

namespace BilvaerkstedApp;

public partial class AppShell : Shell
{
	public AppShell()
	{
		InitializeComponent();

		Routing.RegisterRoute("bookopgave", typeof(BookOpgavePage));
		Routing.RegisterRoute("opgaveoversigt", typeof(OpgaveOversigtPage));

	}
}
