using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        /// <summary>Lấy tối đa <paramref name="limit"/> thông báo của user, mới nhất trước.</summary>
        Task<IReadOnlyList<Notification>> GetByUserIdAsync(Guid userId, int limit = 50, CancellationToken cancellationToken = default);
    }
}
