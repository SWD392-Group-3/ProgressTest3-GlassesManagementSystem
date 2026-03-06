using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace GlassesManagementSystem.Extensions;

public static class DataSeeder
{
    /// <summary>
    /// Seed 3 default accounts (Admin, Staff, Manager) if they don't already exist.
    /// Call this after app.Build() in Program.cs.
    /// </summary>
    public static async Task SeedDefaultAccountsAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Make sure the database/tables are up-to-date
        await db.Database.MigrateAsync();

        var defaultAccounts = new[]
        {
            new { Email = "admin@glasses.com",   Password = "Admin@123",   FullName = "Administrator", Role = "Admin"   },
            new { Email = "staff@glasses.com",   Password = "Staff@123",   FullName = "Default Staff", Role = "Staff"   },
            new { Email = "manager@glasses.com", Password = "Manager@123", FullName = "Default Manager", Role = "Manager" },
        };

        var now = DateTime.UtcNow;

        foreach (var account in defaultAccounts)
        {
            // Skip if account already exists
            var exists = await db.User.AnyAsync(u => u.Email == account.Email);
            if (exists) continue;

            db.User.Add(new User
            {
                Id           = Guid.NewGuid(),
                Email        = account.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(account.Password),
                FullName     = account.FullName,
                Phone        = null,
                Role         = account.Role,
                Status       = "Active",
                CreatedAt    = now,
                UpdatedAt    = now,
            });
        }

        await db.SaveChangesAsync();
    }
}
