using System;
using System.ComponentModel;
using Microsoft.Maui.Controls;

namespace MauiCalc
{
    public partial class MainPage : ContentPage, INotifyPropertyChanged
    {
		//Declare a string variable to store the current number is entered
        public string CurrentInput { get; set; } = string.Empty;
		//Declare a string variable to store the running total after currently calculate
        public string RunningTotal { get; set; } = string.Empty;
		//Declare a private string variable to store the selected opera
        private string selectedOperator;
		//Declare a Boolean to determine whether the screen will reset the next time the user presses a B
        private bool resetOnNextInput = false; 

       //Declare an array of operator
        private readonly string[] operators = { "+", "-", "÷", "×", "=" };

        //Declare an array of the available number
        private readonly string[] numbers = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "." };

        public MainPage()
        {
            InitializeComponent();
            BindingContext = this;
        }

        private string displayText = "0";
        public string DisplayText
        {
            get => displayText;
            set
            {
                displayText = value;
                OnPropertyChanged(nameof(DisplayText));
            }
        }

        private void OnNumberClicked(object sender, EventArgs e)
        {
            if (sender is Button button)
            {
                if (resetOnNextInput)
                {
                    CurrentInput = string.Empty;
                    resetOnNextInput = false;
                }

                if (button.Text == "." && CurrentInput.Contains(".")) return; // Prevent multiple decimals

                CurrentInput += button.Text;
                DisplayText = CurrentInput;
            }
        }

        private void OnOperatorClicked(object sender, EventArgs e)
        {
            if (sender is Button button && !string.IsNullOrEmpty(CurrentInput))
            {
                if (!string.IsNullOrEmpty(RunningTotal) && !string.IsNullOrEmpty(selectedOperator))
                {
                    PerformCalculation();
                }
                else
                {
                    RunningTotal = CurrentInput;
                }

                selectedOperator = button.Text;
                resetOnNextInput = true;
            }
        }

        private void OnEqualClicked(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(RunningTotal) && !string.IsNullOrEmpty(CurrentInput) && !string.IsNullOrEmpty(selectedOperator))
            {
                PerformCalculation();
                selectedOperator = string.Empty;
            }
        }

        private void PerformCalculation()
        {
            if (double.TryParse(RunningTotal, out double num1) && double.TryParse(CurrentInput, out double num2))
            {
                double result = selectedOperator switch
                {
                    "+" => num1 + num2,
                    "-" => num1 - num2,
                    "×" => num1 * num2,
                    "÷" => num2 != 0 ? num1 / num2 : double.NaN,
                    _ => num2
                };

                RunningTotal = result.ToString();
                DisplayText = RunningTotal;
                resetOnNextInput = true;
            }
        }

        private void OnClearClicked(object sender, EventArgs e)
        {
            CurrentInput = string.Empty;
            RunningTotal = string.Empty;
            selectedOperator = string.Empty;
            DisplayText = "0";
        }

        private void OnClearEntryClicked(object sender, EventArgs e)
        {
            CurrentInput = string.Empty;
            DisplayText = "0";
        }

        private void OnDeleteClicked(object sender, EventArgs e)
        {
            if (CurrentInput.Length > 0)
            {
                CurrentInput = CurrentInput.Remove(CurrentInput.Length - 1);
                DisplayText = string.IsNullOrEmpty(CurrentInput) ? "0" : CurrentInput;
            }
        }

        private void OnPercentageClicked(object sender, EventArgs e)
        {
            if (double.TryParse(CurrentInput, out double num))
            {
                CurrentInput = (num / 100).ToString();
                DisplayText = CurrentInput;
                resetOnNextInput = true;
            }
        }

        private void OnSquareClicked(object sender, EventArgs e)
        {
            if (double.TryParse(CurrentInput, out double num))
            {
                CurrentInput = (num * num).ToString();
                DisplayText = CurrentInput;
                resetOnNextInput = true;
            }
        }

        private void OnSquareRootClicked(object sender, EventArgs e)
        {
            if (double.TryParse(CurrentInput, out double num) && num >= 0)
            {
                CurrentInput = Math.Sqrt(num).ToString();
                DisplayText = CurrentInput;
                resetOnNextInput = true;
            }
        }

        private void OnReciprocalClicked(object sender, EventArgs e)
        {
            if (double.TryParse(CurrentInput, out double num) && num != 0)
            {
                CurrentInput = (1 / num).ToString();
                DisplayText = CurrentInput;
                resetOnNextInput = true;
            }
        }

        private void OnNegateClicked(object sender, EventArgs e)
        {
            if (double.TryParse(CurrentInput, out double num))
            {
                CurrentInput = (-num).ToString();
                DisplayText = CurrentInput;
            }
        }
    }
}
