using System.Text;
using BusinessLogicLayer.Services;
using BusinessLogicLayer.Services.Implementations;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Settings;
using DataAccessLayer.Database;
using DataAccessLayer.Repositories.Implementations;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Port cố định (tránh random port → 404)
builder.WebHost.UseUrls("http://localhost:5000");

// JWT (cấu hình từ appsettings, class JwtSettings ở BLL)
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection(CloudinarySettings.SectionName)
);

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>();
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings?.Issuer,
            ValidAudience = jwtSettings?.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings?.Secret ?? "")
            ),
        };
    });

builder.Services.AddScoped<IAuthService, AuthService>();

// Cloudinary Service
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

// Return Exchange Services
builder.Services.AddScoped<IReturnExchangeService, ReturnExchangeService>();
builder.Services.AddScoped<IReturnExchangeRepository, ReturnExchangeRepository>();
builder.Services.AddScoped<IReturnExchangeItemRepository, ReturnExchangeItemRepository>();
builder.Services.AddScoped<IReturnExchangeImageRepository, ReturnExchangeImageRepository>();
builder.Services.AddScoped<IReturnExchangeHistoryRepository, ReturnExchangeHistoryRepository>();

// CORS (cho frontend Next.js)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// DbContext & Unit of Work (một context cho mỗi request)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("DataAccessLayer")
    )
);
builder.Services.AddScoped<IApplicationDbContext>(sp =>
    sp.GetRequiredService<ApplicationDbContext>()
);
builder.Services.AddScoped<
    DataAccessLayer.Repositories.Interfaces.IUnitOfWork,
    DataAccessLayer.Repositories.UnitOfWork
>();
builder.Services.AddScoped<
    DataAccessLayer.Repositories.Interfaces.IUserRepository,
    DataAccessLayer.Repositories.Implementations.UserRepository
>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Glasses API v1");
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
