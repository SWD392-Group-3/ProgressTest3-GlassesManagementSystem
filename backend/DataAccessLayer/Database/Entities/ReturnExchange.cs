using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class ReturnExchange
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }

        public string? Reason { get; set; }
        public string? Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        public virtual Order Order { get; set; } = null!;
    }
}
