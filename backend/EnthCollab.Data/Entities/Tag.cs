namespace EnthCollab.Data.Entities;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
