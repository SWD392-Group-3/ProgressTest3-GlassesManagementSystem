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
    public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.ToTable("CART_ITEMS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UnitPrice)
                .HasColumnType("numeric(18,2)");

            builder.HasOne(x => x.Cart)
                .WithMany(x => x.CartItems)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

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
