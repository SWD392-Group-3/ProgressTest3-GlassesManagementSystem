using BusinessLogicLayer.Services;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Services.Implementations;
using GlassesManagementSystem.Services;
using DataAccessLayer.Database;
using DataAccessLayer.Repositories;
using DataAccessLayer.Repositories.Interfaces;
using DataAccessLayer.Repositories.Implementations;
using Microsoft.EntityFrameworkCore;

namespace GlassesManagementSystem.Extensions;

/// <summary>
/// Đăng ký Dependency Injection theo template: DbContext → Services → Repositories.
/// </summary>
public static class AddDependencyInjection
{
    /// <summary>
    /// Đăng ký toàn bộ DbContext, Services và Repositories cho Glasses Management System.
    /// </summary>
    public static void AddService(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        // DbContext
        serviceCollection.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("DataAccessLayer")
            )
        );
        serviceCollection.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>()
        );
        serviceCollection.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        serviceCollection.AddScoped<IAuthService, AuthService>();
        serviceCollection.AddScoped<ICartService, CartService>();
        serviceCollection.AddScoped<IOrderService, OrderService>();
        serviceCollection.AddScoped<IPaymentService, PaymentService>();
        serviceCollection.AddScoped<IPrescriptionService, PrescriptionService>();
        serviceCollection.AddScoped<IReturnExchangeService, ReturnExchangeService>();
        serviceCollection.AddScoped<ICloudinaryService, CloudinaryService>();
        serviceCollection.AddScoped<IWarrantyPolicyService, WarrantyPolicyService>();
        serviceCollection.AddScoped<IProductManagerService, ProductManagerService>();
        serviceCollection.AddScoped<IPricingPromotionService, PricingPromotionService>();
        serviceCollection.AddScoped<IUserStaffService, UserStaffService>();
        serviceCollection.AddScoped<IRevenueService, RevenueService>();
        serviceCollection.AddScoped<ICategoryService, CategoryService>();
        serviceCollection.AddScoped<INotificationService, NotificationService>();

        // Repositories
        serviceCollection.AddScoped<IUserRepository, UserRepository>();
        serviceCollection.AddScoped<ICustomerRepository, CustomerRepository>();
        serviceCollection.AddScoped<ICartRepository, CartRepository>();
        serviceCollection.AddScoped<ICartItemRepository, CartItemRepository>();
        serviceCollection.AddScoped<IOrderRepository, OrderRepository>();
        serviceCollection.AddScoped<IOrderItemRepository, OrderItemRepository>();
        serviceCollection.AddScoped<IPromotionRepository, PromotionRepository>();
        serviceCollection.AddScoped<IWarrantyPolicyRepository, WarrantyPolicyRepository>();
        serviceCollection.AddScoped<IPaymentRepository, PaymentRepository>();
        serviceCollection.AddScoped<IProductRepository, ProductRepository>();
        serviceCollection.AddScoped<IReturnExchangeRepository, ReturnExchangeRepository>();
        serviceCollection.AddScoped<IReturnExchangeItemRepository, ReturnExchangeItemRepository>();
        serviceCollection.AddScoped<IReturnExchangeImageRepository, ReturnExchangeImageRepository>();
        serviceCollection.AddScoped<IReturnExchangeHistoryRepository, ReturnExchangeHistoryRepository>();
        serviceCollection.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
        serviceCollection.AddScoped<ICategoryRepository, CategoryRepository>();
        serviceCollection.AddScoped<INotificationRepository, NotificationRepository>();
    }
}
