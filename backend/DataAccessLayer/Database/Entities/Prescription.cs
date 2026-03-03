using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Prescription
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }

        public string? CangKinh { get; set; }
        public string? BanLe { get; set; }
        public string? VienGong { get; set; }
        public string? ChanVeMui { get; set; }
        public string? CauGong { get; set; }
        public string? DuoiGong { get; set; }

        public string? Note { get; set; }
        /// <summary>Trạng thái sau kiểm tra đổi trả (vd. Available, Defective, Damaged, NeedRepair).</summary>
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Customer Customer { get; set; } = null!;
        public virtual Service Service { get; set; } = null!;
    }
}
