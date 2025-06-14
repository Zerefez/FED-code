using JanuarMAUI.Views;

namespace JanuarMAUI;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();
        
        Routing.RegisterRoute("AddHabitPage", typeof(AddHabitPage));
    }
}
