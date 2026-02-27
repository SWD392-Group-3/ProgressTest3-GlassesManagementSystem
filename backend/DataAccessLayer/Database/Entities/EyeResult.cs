using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class EyeResult
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid StaffId { get; set; }

        public string? EyeLeft { get; set; }
        public string? EyeRight { get; set; }

        public bool Vien { get; set; }
        public bool Loan { get; set; }
        public int? Can { get; set; }

        public string? Note { get; set; }

        public virtual Order Order { get; set; } = null!;
        public virtual User Staff { get; set; } = null!;
    }
}
