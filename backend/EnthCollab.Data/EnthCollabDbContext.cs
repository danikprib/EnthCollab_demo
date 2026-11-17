using EnthCollab.Data.Constants;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;


namespace EnthCollab.Data;

public class EnthCollabDbContext : DbContext
{
    public EnthCollabDbContext(DbContextOptions<EnthCollabDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProjectLike> ProjectLikes => Set<ProjectLike>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Role).HasDefaultValue(UserRoles.User);
            e.ToTable(t => t.HasCheckConstraint("CK_User_Role", "\"Role\" IN ('User','Admin')"));
        });

        modelBuilder.Entity<Tag>(e =>
        {
            e.Property(t => t.Name).IsRequired().HasMaxLength(TagConstants.MaxNameLength);
            e.HasIndex(t => t.Name).IsUnique();
        });

        modelBuilder.Entity<ProjectLike>(e =>
        {
            e.HasKey(l => new { l.UserId, l.ProjectId });
            e.HasOne(l => l.User).WithMany(u => u.Likes).HasForeignKey(l => l.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Project).WithMany(p => p.Likes).HasForeignKey(l => l.ProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(r => r.TokenHash).IsUnique();
            e.HasOne(r => r.User).WithMany(u => u.RefreshTokens).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<Project>(entity =>
        {
            entity.Property(p => p.Status).HasConversion<string>();
            entity.Property(p => p.Visibility).HasConversion<string>();

            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Project_Status",
                    "\"Status\" IN ('WIP','Finished','Cancelled','Frozen')");
                t.HasCheckConstraint("CK_Project_Visibility",
                    "\"Visibility\" IN ('Public','Private')");
            });

            entity.HasOne<User>(p => p.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(p => p.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.Property(t => t.Status).HasConversion<string>();
            entity.Property(t => t.Difficulty).HasConversion<string>();

            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Ticket_Status",
                    "\"Status\" IN ('Open','Taken','Done')");
                t.HasCheckConstraint("CK_Ticket_Difficulty",
                    "\"Difficulty\" IN ('Easy','Medium','Hard','Advanced')");
            });

            entity.HasOne(t => t.Project)
                  .WithMany(p => p.Tickets)
                  .HasForeignKey(t => t.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

    }
}