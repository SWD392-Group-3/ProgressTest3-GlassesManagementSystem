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
    public class LensVariantConfiguration : IEntityTypeConfiguration<LensVariant>
    {
        public void Configure(EntityTypeBuilder<LensVariant> builder)
        {
            builder.ToTable("LENSES_VARIANTS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Price)
                .HasColumnType("numeric(18,2)");

            builder.Property(x => x.DoCau)
                .HasColumnType("numeric(10,2)");

            builder.Property(x => x.DoTru)
                .HasColumnType("numeric(10,2)");

            builder.Property(x => x.ChiSoKhucXa)
                .HasColumnType("numeric(10,2)");

            builder.HasOne(x => x.Product)
                .WithMany(x => x.LensVariants)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
