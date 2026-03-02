using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class ReturnExchangeConfiguration : IEntityTypeConfiguration<ReturnExchange>
    {
        public void Configure(EntityTypeBuilder<ReturnExchange> builder)
        {
            builder.ToTable("RETURN_EXCHANGES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Status).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Reason).HasMaxLength(1000);
            builder.Property(x => x.RejectionReason).HasMaxLength(1000);
            builder.Property(x => x.CreatedAt).HasColumnType("timestamptz");
            builder.Property(x => x.ReviewedBySalesAt).HasColumnType("timestamptz");
            builder.Property(x => x.ReceivedByOperationAt).HasColumnType("timestamptz");
            builder.Property(x => x.ResolvedAt).HasColumnType("timestamptz");

            builder
                .HasOne(x => x.Order)
                .WithMany(x => x.ReturnExchanges)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasMany(x => x.ReturnExchangeItems)
                .WithOne(x => x.ReturnExchange)
                .HasForeignKey(x => x.ReturnExchangeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasMany(x => x.Histories)
                .WithOne(x => x.ReturnExchange)
                .HasForeignKey(x => x.ReturnExchangeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
