
using SQLite;


namespace SelectImages.Models;

public class ImageInfo
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; } 
    public string Title { get; set ; } 
    public string Path { get; set; } 
    public string Description { get; set ; }

}