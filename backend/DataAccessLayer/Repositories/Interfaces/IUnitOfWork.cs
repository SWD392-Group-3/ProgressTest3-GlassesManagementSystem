namespace DataAccessLayer.Repositories.Interfaces
{
    /// <summary>
    /// Unit of Work: nhóm mọi thao tác DB trong một context, commit/rollback một lần.
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<T> GetRepository<T>() where T : class;
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}