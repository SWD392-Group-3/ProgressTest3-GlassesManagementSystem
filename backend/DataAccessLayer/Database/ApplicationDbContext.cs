using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database.Configurations;
using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Database
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<WarrantyPolicy> WarrantyPolicies { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<Combo> Combos { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<Customer> Customer { get; set; }
        public DbSet<Prescription> Prescription { get; set; }
        public DbSet<Service> Service { get; set; }
        public DbSet<Cart> Cart { get; set; }
        public DbSet<CartItem> CartItem { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<OrderItem> OrderItem { get; set; }
        public DbSet<Payment> Payment { get; set; }
        public DbSet<Promotion> Promotion { get; set; }
        public DbSet<ReturnExchange> ReturnExchange { get; set; }
        public DbSet<ReturnExchangeItem> ReturnExchangeItem { get; set; }
        public DbSet<ReturnExchangeImage> ReturnExchangeImage { get; set; }
        public DbSet<ReturnExchangeHistory> ReturnExchangeHistory { get; set; }
        public DbSet<Slot> Slot { get; set; }
        public DbSet<EyeResult> EyeResult { get; set; }

        public DbSet<Brand> Brand { get; set; }

        public DbSet<ComboItem> ComboItem { get; set; }

        public DbSet<ProductVariant> ProductVariant { get; set; }

        public DbSet<LensVariant> LensVariant { get; set; }

        public DbSet<Notification> Notification { get; set; }

        public new DbSet<T> Set<T>()
            where T : class => base.Set<T>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure relationships and constraints here if needed

            modelBuilder.ApplyConfiguration<Category>(new CategoryConfiguration());
            modelBuilder.ApplyConfiguration<Product>(new ProductConfiguration());
            modelBuilder.ApplyConfiguration<WarrantyPolicy>(new WarrantyPolicyConfiguration());
            modelBuilder.ApplyConfiguration<Promotion>(new PromotionConfiguration());
            modelBuilder.ApplyConfiguration<Combo>(new ComboConfiguration());
            modelBuilder.ApplyConfiguration<User>(new UserConfiguration());
            modelBuilder.ApplyConfiguration<Customer>(new CustomerConfiguration());
            modelBuilder.ApplyConfiguration<Prescription>(new PrescriptionConfiguration());
            modelBuilder.ApplyConfiguration<Service>(new ServiceConfiguration());
            modelBuilder.ApplyConfiguration<Cart>(new CartConfiguration());
            modelBuilder.ApplyConfiguration<CartItem>(new CartItemConfiguration());
            modelBuilder.ApplyConfiguration<Order>(new OrderConfiguration());
            modelBuilder.ApplyConfiguration<OrderItem>(new OrderItemConfiguration());
            modelBuilder.ApplyConfiguration<Payment>(new PaymentConfiguration());
            modelBuilder.ApplyConfiguration<Promotion>(new PromotionConfiguration());
            modelBuilder.ApplyConfiguration<ReturnExchange>(new ReturnExchangeConfiguration());
            modelBuilder.ApplyConfiguration<ReturnExchangeItem>(
                new ReturnExchangeItemConfiguration()
            );
            modelBuilder.ApplyConfiguration<ReturnExchangeImage>(
                new ReturnExchangeImageConfiguration()
            );
            modelBuilder.ApplyConfiguration<ReturnExchangeHistory>(
                new ReturnExchangeHistoryConfiguration()
            );
            modelBuilder.ApplyConfiguration<Slot>(new SlotConfiguration());
            modelBuilder.ApplyConfiguration<EyeResult>(new EyeResultConfiguration());
            modelBuilder.ApplyConfiguration<Brand>(new BrandConfiguration());
            modelBuilder.ApplyConfiguration<ComboItem>(new ComboItemConfiguration());
            modelBuilder.ApplyConfiguration<ProductVariant>(new ProductVariantConfiguration());
            modelBuilder.ApplyConfiguration<LensVariant>(new LensVariantConfiguration());
            modelBuilder.ApplyConfiguration<Notification>(new NotificationConfiguration());
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // You can add custom logic here before saving changes, such as setting timestamps or handling soft deletes
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
