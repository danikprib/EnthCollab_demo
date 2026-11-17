using EnthCollab.Data;
using EnthCollab.Data.Constants;
using EnthCollab.Data.Entities;

namespace EnthCollab.Api;

public static class AdminSeeder
{
    public static void Seed(EnthCollabDbContext db, IConfiguration config)
    {
        var email = config["Admin:Email"]; var password = config["Admin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;
        if (db.Users.Any(u => u.Email == email)) return;
        db.Users.Add(new User
        {
            Username = AuthConstants.DefaultAdminUsername,
            Email = email,
            Role = UserRoles.Admin,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, AuthConstants.BcryptWorkFactor)
        });
        db.SaveChanges();
    }
}
