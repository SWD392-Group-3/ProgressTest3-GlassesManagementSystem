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
    public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
    {
        public void Configure(EntityTypeBuilder<Promotion> builder)
        {
            builder.ToTable("PROMOTIONS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Code)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(x => x.Code).IsUnique();

            builder.Property(x => x.DiscountValue)
                .HasColumnType("numeric(18,2)");

            builder.Property(x => x.StartDate).HasColumnType("timestamptz");
            builder.Property(x => x.EndDate).HasColumnType("timestamptz");

            builder.Property(x => x.Status).HasMaxLength(50);
        }
    }
}
