using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;


namespace EnthCollab.Data;

public class EnthCollabDbContext : DbContext
{
    public EnthCollabDbContext(DbContextOptions<EnthCollabDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Convert Enums to string representation in Database columns
        modelBuilder.Entity<Project>()
            .Property(p => p.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Ticket>()
            .Property(t => t.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Ticket>()
            .Property(t => t.Difficulty)
            .HasConversion<string>();

        // Configure One-to-Many relationship (Project -> Tickets)
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tickets)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}