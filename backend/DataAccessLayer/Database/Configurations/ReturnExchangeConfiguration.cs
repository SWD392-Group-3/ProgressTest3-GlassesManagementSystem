using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Configurations
{
    public class ReturnExchangeConfiguration : IEntityTypeConfiguration<ReturnExchange>
    {
        public void Configure(EntityTypeBuilder<ReturnExchange> builder)
        {
            builder.ToTable("RETURN_EXCHANGES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Status).HasMaxLength(50);
            builder.Property(x => x.CreatedAt).HasColumnType("timestamptz");
            builder.Property(x => x.ResolvedAt).HasColumnType("timestamptz");

            builder.HasOne(x => x.Order)
                .WithMany(x => x.ReturnExchanges)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
