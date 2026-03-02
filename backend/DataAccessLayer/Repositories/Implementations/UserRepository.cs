using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementations;

/// <summary>
/// Repository User: kế thừa GenericRepository&lt;User&gt; để dùng sẵn GetById, AddAsync, Update, Delete, ...
/// Chỉ bổ sung GetByEmailAsync cho nghiệp vụ login/register.
/// </summary>
public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(IApplicationDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = (email ?? "").Trim().ToLower();
        if (string.IsNullOrEmpty(normalizedEmail))
            return null;

        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
    }
}
