using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces;

/// <summary>
/// Repository cho User: kế thừa CRUD từ IGenericRepository&lt;User&gt;, thêm truy vấn theo nghiệp vụ (email).
/// </summary>
public interface IUserRepository : IGenericRepository<User>
{
    /// <summary>
    /// Lấy user theo email (phục vụ login). So khớp không phân biệt hoa thường.
    /// </summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
