using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Settings;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace BusinessLogicLayer.Services.Implementations
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinarySettings _settings;

        public CloudinaryService(IOptions<CloudinarySettings> settings)
        {
            _settings = settings.Value;

            var account = new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret);

            _cloudinary = new Cloudinary(account);
        }

        public async Task<(string? Url, string? Error)> UploadImageAsync(
            IFormFile file,
            string folder,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                if (file == null || file.Length == 0)
                    return (null, "File không hợp lệ");

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                    return (null, "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)");

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    return (null, "Kích thước file không được vượt quá 5MB");

                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = $"{_settings.Folder}/{folder}",
                    Transformation = new Transformation()
                        .Width(1200)
                        .Height(1200)
                        .Crop("limit")
                        .Quality("auto"),
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

                if (uploadResult.Error != null)
                    return (null, $"Lỗi upload: {uploadResult.Error.Message}");

                return (uploadResult.SecureUrl.ToString(), null);
            }
            catch (Exception ex)
            {
                return (null, $"Lỗi khi upload ảnh: {ex.Message}");
            }
        }

        public async Task<(List<string>? Urls, string? Error)> UploadMultipleImagesAsync(
            List<IFormFile> files,
            string folder,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                if (files == null || files.Count == 0)
                    return (null, "Không có file nào được chọn");

                if (files.Count > 5)
                    return (null, "Tối đa 5 hình ảnh");

                var urls = new List<string>();

                foreach (var file in files)
                {
                    var (url, error) = await UploadImageAsync(file, folder, cancellationToken);

                    if (error != null)
                        return (null, error);

                    if (url != null)
                        urls.Add(url);
                }

                return (urls, null);
            }
            catch (Exception ex)
            {
                return (null, $"Lỗi khi upload nhiều ảnh: {ex.Message}");
            }
        }

        public async Task<(bool Success, string? Error)> DeleteImageAsync(
            string publicId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                if (string.IsNullOrWhiteSpace(publicId))
                    return (false, "Public ID không hợp lệ");

                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);

                if (result.Result == "ok")
                    return (true, null);

                return (false, $"Không thể xóa ảnh: {result.Error?.Message}");
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi khi xóa ảnh: {ex.Message}");
            }
        }
    }
}
