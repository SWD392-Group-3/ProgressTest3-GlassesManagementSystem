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
    public class ComboRepository : GenericRepository<Combo>, IComboRepository
    {
        public ComboRepository(IApplicationDbContext context) : base(context)
        {
        }
    }
}
