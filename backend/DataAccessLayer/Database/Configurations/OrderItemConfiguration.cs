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
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("ORDER_ITEMS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UnitPrice).HasColumnType("numeric(18,2)");
            builder.Property(x => x.TotalPrice).HasColumnType("numeric(18,2)");

            builder.HasOne(x => x.Order)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ProductVariant)
            .WithMany()
            .HasForeignKey(x => x.ProductVariantId)
            .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.LensesVariant)
                .WithMany()
                .HasForeignKey(x => x.LensesVariantId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.ComboItem)
                .WithMany()
                .HasForeignKey(x => x.ComboItemId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Service)
                .WithMany()
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Slot)
                .WithMany()   // không cần navigation bên Slot
                .HasForeignKey(x => x.SlotId)
                .OnDelete(DeleteBehavior.SetNull);

        }
    }
}
