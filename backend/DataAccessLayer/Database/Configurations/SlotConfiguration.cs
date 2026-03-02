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
    public class SlotConfiguration : IEntityTypeConfiguration<Slot>
    {
        public void Configure(EntityTypeBuilder<Slot> builder)
        {
            builder.ToTable("SLOTS");

            builder.HasKey(x => x.Id);

            // Date
            builder.Property(x => x.Date)
                   .HasColumnType("date")
                   .IsRequired();

            // Time
            builder.Property(x => x.StartTime)
                   .HasColumnType("time")
                   .IsRequired();

            builder.Property(x => x.EndTime)
                   .HasColumnType("time")
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasMaxLength(50);

            builder.Property(x => x.Note)
                   .HasMaxLength(500);

            // Index để tránh trùng slot trong 1 ngày
            builder.HasIndex(x => new { x.Date, x.StartTime, x.EndTime })
                   .IsUnique();
        }
    }
}
