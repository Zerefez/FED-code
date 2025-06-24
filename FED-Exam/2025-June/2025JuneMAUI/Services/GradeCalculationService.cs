using _2025JuneMAUI.Models;

namespace _2025JuneMAUI.Services
{
    // Static utility class for grade calculation and analysis operations
    // Uses static methods to avoid dependency injection overhead for pure calculation logic
    // Encapsulates Danish grading system knowledge and statistical operations
    public static class GradeCalculationService
    {
        // Static readonly dictionary mapping Danish grades to numerical values
        // Readonly prevents modification after initialization ensuring data integrity
        // Danish 7-step grading scale: -3 (lowest) to 12 (highest)
        private static readonly Dictionary<string, int> GradeValues = new() 
        {
            { "-3", -3 },   // Lowest grade - significant deficiencies
            { "00", 0 },    // Inadequate performance
            { "02", 2 },    // Adequate performance
            { "4", 4 },     // Fair performance  
            { "7", 7 },     // Good performance
            { "10", 10 },   // Very good performance
            { "12", 12 }    // Excellent performance
        };

        // Calculate average grade as nearest Danish grade value
        // Returns string representation of grade rather than numerical average
        // Provides meaningful grade representation in Danish education context
        public static string CalculateAverageGrade(IEnumerable<Student> students)
        {
            // Filter students to include only those with valid, gradeable entries
            // Excludes null, empty, or invalid grade values from calculation
            var validGrades = students
                .Where(s => !string.IsNullOrEmpty(s.Grade) && GradeValues.ContainsKey(s.Grade))
                .Select(s => GradeValues[s.Grade])
                .ToList();
            
            // Return "N/A" if no valid grades exist to prevent division by zero
            // Provides meaningful result for incomplete or empty datasets
            if (!validGrades.Any()) return "N/A";
            
            // Calculate numerical average of grade values
            var average = validGrades.Average();
            
            // Find Danish grade closest to calculated average
            // OrderBy with Math.Abs finds grade with minimum distance from average
            // Returns the key (grade string) of the closest match
            return GradeValues.OrderBy(kvp => Math.Abs(kvp.Value - average)).First().Key;
        }

        // Generate grade distribution statistics for reporting and analysis
        // Returns dictionary with grade as key and count as value
        // Useful for understanding grade patterns and class performance
        public static Dictionary<string, int> GetGradeDistribution(IEnumerable<Student> students)
        {
            // Initialize dictionary with all possible grades set to zero count
            // Ensures all grades appear in distribution even if no students received them
            var distribution = GradeValues.Keys.ToDictionary(grade => grade, _ => 0);
            
            // Count actual grades assigned to students
            // Groups students by grade and counts occurrences
            var gradeCounts = students
                .Where(s => !string.IsNullOrEmpty(s.Grade))  // Filter out ungraded students
                .GroupBy(s => s.Grade)                       // Group by grade value
                .ToDictionary(g => g.Key, g => g.Count());   // Convert to grade->count mapping
            
            // Merge actual counts into initialized distribution
            // Updates counts for grades that were actually assigned
            foreach (var (grade, count) in gradeCounts)
            {
                // Only update if grade is valid in Danish system
                if (distribution.ContainsKey(grade))
                {
                    distribution[grade] = count;
                }
            }
            
            // Return complete distribution with all grades represented
            return distribution;
        }

        // Calculate numerical average without converting back to grade scale
        // Provides precise average for statistical analysis and reporting
        // Useful when exact numerical value is needed rather than grade approximation
        public static double CalculateNumericalAverage(IEnumerable<Student> students)
        {
            // Filter and convert grades to numerical values same as CalculateAverageGrade
            var validGrades = students
                .Where(s => !string.IsNullOrEmpty(s.Grade) && GradeValues.ContainsKey(s.Grade))
                .Select(s => GradeValues[s.Grade])
                .ToList();
            
            // Return 0.0 if no valid grades exist
            // Provides safe default value for empty datasets
            return validGrades.Any() ? validGrades.Average() : 0.0;
        }
    }
} 