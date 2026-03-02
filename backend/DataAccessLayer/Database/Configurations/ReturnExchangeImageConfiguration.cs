using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class ReturnExchangeImageConfiguration : IEntityTypeConfiguration<ReturnExchangeImage>
    {
        public void Configure(EntityTypeBuilder<ReturnExchangeImage> builder)
        {
            builder.ToTable("RETURN_EXCHANGE_IMAGES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ImageUrl).HasMaxLength(500).IsRequired();
            builder.Property(x => x.UploadedByRole).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(500);
            builder.Property(x => x.UploadedAt).HasColumnType("timestamptz");

            builder
                .HasOne(x => x.ReturnExchangeItem)
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.ReturnExchangeItemId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
