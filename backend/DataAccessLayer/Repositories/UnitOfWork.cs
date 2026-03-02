using DataAccessLayer.Database;
using DataAccessLayer.Repositories.Implementations;
using DataAccessLayer.Repositories.Interfaces;

namespace DataAccessLayer.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly IApplicationDbContext _context;
        private readonly Dictionary<Type, object> _repositories = new();

        public UnitOfWork(IApplicationDbContext context)
        {
            _context = context;
        }

        public IGenericRepository<T> GetRepository<T>()
            where T : class
        {
            var type = typeof(T);
            if (_repositories.TryGetValue(type, out var repo))
                return (IGenericRepository<T>)repo;

            var repository = new GenericRepository<T>(_context);
            _repositories.Add(type, repository);
            return repository;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public void Dispose()
        {
            // DbContext sẽ được DI container dispose nếu dùng scoped
        }
    }
}
