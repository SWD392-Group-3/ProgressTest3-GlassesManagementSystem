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
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("NOTIFICATIONS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.Type).HasMaxLength(50);
            builder.Property(x => x.Status).HasMaxLength(20);
            builder.Property(x => x.LinkTo).HasMaxLength(255);

            builder.Property(x => x.CreatedAt)
                .HasColumnType("timestamptz");

            builder.Property(x => x.ReadAt)
                .HasColumnType("timestamptz");

            builder.HasIndex(x => new { x.UserId, x.Status });
        }
    }
}
