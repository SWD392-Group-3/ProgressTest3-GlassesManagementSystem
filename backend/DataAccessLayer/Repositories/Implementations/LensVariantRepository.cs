using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace DataAccessLayer.Repositories.Implementations
{
    public class LensVariantRepository : GenericRepository<LensVariant>, ILensVariantRepository
    {
        public LensVariantRepository(IApplicationDbContext context) : base(context)
        {
        }
    }
}
