using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Implementations;
using DataAccessLayer.Repositories.Interfaces;

namespace DataAccessLayer.Repositories
{
    public class EyeResultRepository : GenericRepository<EyeResult>, IEyeResultRepository
    {
        public EyeResultRepository(IApplicationDbContext context) : base(context)
        {
        }
    }
}
