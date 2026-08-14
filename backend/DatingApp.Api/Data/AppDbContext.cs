using DatingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Like>(e =>
        {
            e.HasIndex(l => new { l.FromUserId, l.ToUserId }).IsUnique();
        });

        modelBuilder.Entity<Match>(e =>
        {
            e.HasIndex(m => new { m.UserAId, m.UserBId }).IsUnique();
            e.HasMany(m => m.Messages)
                .WithOne(msg => msg.Match)
                .HasForeignKey(msg => msg.MatchId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Store Interests list as a simple comma-joined string for portability
        modelBuilder.Entity<Profile>()
            .Property(p => p.Interests)
            .HasConversion(
                v => string.Join(',', v),
                v => v == "" ? new List<string>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );

        base.OnModelCreating(modelBuilder);
    }
}
