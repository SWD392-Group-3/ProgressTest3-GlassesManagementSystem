using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class ReturnExchangeItemConfiguration : IEntityTypeConfiguration<ReturnExchangeItem>
    {
        public void Configure(EntityTypeBuilder<ReturnExchangeItem> builder)
        {
            builder.ToTable("RETURN_EXCHANGE_ITEMS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Quantity).IsRequired();
            builder.Property(x => x.Reason).HasMaxLength(1000);
            builder.Property(x => x.Status).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Note).HasMaxLength(1000);
            builder.Property(x => x.InspectionResult).HasMaxLength(50).IsRequired(false);
            builder.Property(x => x.CreatedAt).HasColumnType("timestamptz");

            builder
                .HasOne(x => x.ReturnExchange)
                .WithMany(x => x.ReturnExchangeItems)
                .HasForeignKey(x => x.ReturnExchangeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(x => x.OrderItem)
                .WithMany(x => x.ReturnExchangeItems)
                .HasForeignKey(x => x.OrderItemId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasMany(x => x.Images)
                .WithOne(x => x.ReturnExchangeItem)
                .HasForeignKey(x => x.ReturnExchangeItemId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
