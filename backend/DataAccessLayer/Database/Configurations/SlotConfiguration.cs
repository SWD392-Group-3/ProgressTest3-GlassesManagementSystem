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

            builder.Property(x => x.StartTime).HasColumnType("timestamptz");
            builder.Property(x => x.EndTime).HasColumnType("timestamptz");

            builder.Property(x => x.Status).HasMaxLength(50);

            builder.HasIndex(x => new { x.StartTime, x.EndTime });
        }
    }
}
