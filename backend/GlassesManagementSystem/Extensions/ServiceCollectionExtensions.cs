using BusinessLogicLayer.Services;
using BusinessLogicLayer.Services.Implementations;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database;
using DataAccessLayer.Repositories;
using DataAccessLayer.Repositories.Implementations;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GlassesManagementSystem.Extensions;

/// <summary>
/// Extension methods đăng ký DI cho các tầng Data Access (DAL) và Business Logic (BLL).
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Đăng ký các service của tầng Data Access Layer (DbContext, UnitOfWork, Repositories).
    /// </summary>
    public static IServiceCollection AddDataAccess(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("DataAccessLayer")
            )
        );

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>()
        );
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<ICartItemRepository, CartItemRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderItemRepository, OrderItemRepository>();
        services.AddScoped<IPromotionRepository, PromotionRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();

        // Return Exchange Repositories
        services.AddScoped<IReturnExchangeRepository, ReturnExchangeRepository>();
        services.AddScoped<IReturnExchangeItemRepository, ReturnExchangeItemRepository>();
        services.AddScoped<IReturnExchangeImageRepository, ReturnExchangeImageRepository>();
        services.AddScoped<IReturnExchangeHistoryRepository, ReturnExchangeHistoryRepository>();

        // Prescription Repository
        services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();

        return services;
    }

    /// <summary>
    /// Đăng ký các service của tầng Business Logic Layer (AuthService, ...).
    /// </summary>
    public static IServiceCollection AddBusinessLogic(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IPrescriptionService, PrescriptionService>();
        // Return Exchange Service
        services.AddScoped<IReturnExchangeService, ReturnExchangeService>();
        return services;
    }
}
