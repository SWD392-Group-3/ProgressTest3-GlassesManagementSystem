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
    public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
    {
        public void Configure(EntityTypeBuilder<Prescription> builder)
        {
            builder.ToTable("PRESCRIPTIONS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Status).HasMaxLength(50);
            builder.Property(x => x.CreatedAt).HasColumnType("timestamptz");
            builder.Property(x => x.UpdatedAt).HasColumnType("timestamptz");

            builder.HasOne(x => x.Customer)
                .WithMany(x => x.Prescriptions)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Service)
                .WithMany(x => x.Prescriptions)
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Order)
                .WithOne(x => x.Prescription)
                .HasForeignKey<Prescription>(x => x.OrderId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
