using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
    {
        public void Configure(EntityTypeBuilder<Feedback> builder)
        {
            builder.ToTable("Feedbacks");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.Rating)
                .IsRequired();

            builder.Property(f => f.Comment)
                .HasMaxLength(1000);

            builder.HasOne(f => f.Customer)
                .WithMany()
                .HasForeignKey(f => f.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(f => f.Product)
                .WithMany()
                .HasForeignKey(f => f.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(f => f.OrderItem)
                .WithMany()
                .HasForeignKey(f => f.OrderItemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
