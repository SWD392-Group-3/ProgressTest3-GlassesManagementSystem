using BusinessLogicLayer.Services;
using DataAccessLayer.Database;
using DataAccessLayer.Repositories;
using DataAccessLayer.Repositories.Implementations;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

        // Return Exchange Repositories
        services.AddScoped<IReturnExchangeRepository, ReturnExchangeRepository>();
        services.AddScoped<IReturnExchangeItemRepository, ReturnExchangeItemRepository>();
        services.AddScoped<IReturnExchangeImageRepository, ReturnExchangeImageRepository>();
        services.AddScoped<IReturnExchangeHistoryRepository, ReturnExchangeHistoryRepository>();

        return services;
    }

    /// <summary>
    /// Đăng ký các service của tầng Business Logic Layer (AuthService, ...).
    /// </summary>
    public static IServiceCollection AddBusinessLogic(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}
