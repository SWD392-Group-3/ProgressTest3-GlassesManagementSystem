using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Database
{
    public interface IApplicationDbContext
    {
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

        public DbSet<Notification> Notification { get; set; }

        DbSet<T> Set<T>()
            where T : class;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
