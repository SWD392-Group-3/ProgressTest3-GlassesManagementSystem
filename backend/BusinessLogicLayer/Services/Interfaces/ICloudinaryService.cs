using BusinessLogicLayer.Settings;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICloudinaryService
    {
        Task<(string? Url, string? Error)> UploadImageAsync(
            IFormFile file,
            string folder,
            CancellationToken cancellationToken = default
        );
        Task<(List<string>? Urls, string? Error)> UploadMultipleImagesAsync(
            List<IFormFile> files,
            string folder,
            CancellationToken cancellationToken = default
        );
        Task<(bool Success, string? Error)> DeleteImageAsync(
            string publicId,
            CancellationToken cancellationToken = default
        );
    }
}
