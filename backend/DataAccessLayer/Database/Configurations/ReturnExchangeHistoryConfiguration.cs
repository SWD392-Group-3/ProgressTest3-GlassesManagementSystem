using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class ReturnExchangeHistoryConfiguration
        : IEntityTypeConfiguration<ReturnExchangeHistory>
    {
        public void Configure(EntityTypeBuilder<ReturnExchangeHistory> builder)
        {
            builder.ToTable("RETURN_EXCHANGE_HISTORIES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Action).HasMaxLength(100).IsRequired();
            builder.Property(x => x.OldStatus).HasMaxLength(50);
            builder.Property(x => x.NewStatus).HasMaxLength(50);
            builder.Property(x => x.Comment).HasMaxLength(1000);
            builder.Property(x => x.PerformedByRole).HasMaxLength(50).IsRequired();
            builder.Property(x => x.PerformedAt).HasColumnType("timestamptz");

            builder
                .HasOne(x => x.ReturnExchange)
                .WithMany(x => x.Histories)
                .HasForeignKey(x => x.ReturnExchangeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
