using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace GlassesManagementSystem.Extensions;

/// <summary>
/// Thêm security scheme Bearer JWT vào OpenAPI document để Swagger UI hiển thị nút Authorize và gửi token khi gọi API.
/// </summary>
internal sealed class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    private readonly IAuthenticationSchemeProvider _schemeProvider;

    public BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider schemeProvider)
    {
        _schemeProvider = schemeProvider;
    }

    public async Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        var schemes = await _schemeProvider.GetAllSchemesAsync();
        if (!schemes.Any(s => s.Name == "Bearer"))
            return;

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Nhập JWT nhận được từ API login/register. Ví dụ: eyJhbGciOiJIUzI1NiIs..."
        };

        // Áp dụng cho mọi operation để Swagger UI gửi token khi user đã Authorize
        foreach (var pathItem in document.Paths.Values)
        {
            foreach (var operation in pathItem.Operations.Values)
            {
                operation.Security ??= [];
                operation.Security.Add(new OpenApiSecurityRequirement
                {
                    [new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Id = "Bearer",
                            Type = ReferenceType.SecurityScheme
                        }
                    }] = []
                });
            }
        }
    }
}
