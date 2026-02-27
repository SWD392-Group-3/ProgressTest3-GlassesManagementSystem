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
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("ORDERS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.TotalAmount).HasColumnType("numeric(18,2)");
            builder.Property(x => x.DiscountAmount).HasColumnType("numeric(18,2)");
            builder.Property(x => x.FinalAmount).HasColumnType("numeric(18,2)");
            builder.Property(x => x.OrderDate).HasColumnType("timestamptz");

            builder.Property(x => x.Status).HasMaxLength(50);

            builder.HasOne(x => x.Customer)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.Status);
        }
    }
}
