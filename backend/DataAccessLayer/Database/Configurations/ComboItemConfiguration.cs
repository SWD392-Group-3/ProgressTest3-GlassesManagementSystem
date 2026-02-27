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
    public class ComboItemConfiguration : IEntityTypeConfiguration<ComboItem>
    {
        public void Configure(EntityTypeBuilder<ComboItem> builder)
        {
            builder.ToTable("COMBO_ITEMS");

            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Combo)
                .WithMany(x => x.ComboItems)
                .HasForeignKey(x => x.ComboId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
