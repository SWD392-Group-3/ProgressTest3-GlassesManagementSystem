# Tích hợp Cloudinary để lưu trữ hình ảnh

Hệ thống đã được tích hợp Cloudinary để lưu trữ hình ảnh trong quy trình hoàn hàng.

## Cài đặt

Các packages đã được cài đặt:

- `CloudinaryDotNet` (v1.28.0) - SDK Cloudinary cho .NET
- `dotenv.net` (v4.0.1) - Quản lý environment variables

## Cấu hình Cloudinary

### 1. Đăng ký tài khoản Cloudinary

1. Truy cập [Cloudinary](https://cloudinary.com/)
2. Đăng ký tài khoản miễn phí (Free Plan)
3. Sau khi đăng ký, bạn sẽ nhận được thông tin:
   - Cloud Name
   - API Key
   - API Secret

### 2. Cấu hình trong appsettings.json

Cập nhật file `appsettings.json` hoặc `appsettings.Development.json`:

```json
{
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret",
    "Folder": "return-exchange-images"
  }
}
```

### 3. Sử dụng .env file (tùy chọn)

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật thông tin Cloudinary trong file `.env`:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## CloudinaryService

Service cung cấp các phương thức:

### 1. UploadImageAsync

Upload một hình ảnh lên Cloudinary

```csharp
Task<(string? Url, string? Error)> UploadImageAsync(
    IFormFile file,
    string folder,
    CancellationToken cancellationToken = default)
```

### 2. UploadMultipleImagesAsync

Upload nhiều hình ảnh (tối đa 5)

```csharp
Task<(List<string>? Urls, string? Error)> UploadMultipleImagesAsync(
    List<IFormFile> files,
    string folder,
    CancellationToken cancellationToken = default)
```

### 3. DeleteImageAsync

Xóa hình ảnh từ Cloudinary

```csharp
Task<(bool Success, string? Error)> DeleteImageAsync(
    string publicId,
    CancellationToken cancellationToken = default)
```

## API Endpoint mới

### POST /api/ReturnExchange/upload-images

Upload hình ảnh cho sản phẩm hoàn hàng lên Cloudinary

**Content-Type:** `multipart/form-data`

**Parameters:**

- `returnExchangeItemId` (Guid) - ID của sản phẩm hoàn hàng
- `images` (List<IFormFile>) - Danh sách file ảnh (tối đa 5)
- `role` (string) - Vai trò upload (Customer, Sales, Operation)
- `description` (string, optional) - Mô tả hình ảnh

**Response:**

```json
{
  "message": "Upload hình ảnh thành công",
  "imageUrls": [
    "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/path/to/image1.jpg",
    "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/path/to/image2.jpg"
  ]
}
```

## Ví dụ sử dụng với Postman/cURL

### Upload images với Postman

1. Chọn method: `POST`
2. URL: `http://localhost:5000/api/ReturnExchange/upload-images`
3. Tab Body → chọn `form-data`
4. Thêm các fields:
   - `returnExchangeItemId`: guid-value
   - `role`: Customer
   - `description`: Hình ảnh sản phẩm lỗi
   - `images`: (File) - Chọn file ảnh (có thể chọn nhiều)

### cURL Example

```bash
curl -X POST http://localhost:5000/api/ReturnExchange/upload-images \
  -F "returnExchangeItemId=00000000-0000-0000-0000-000000000000" \
  -F "role=Customer" \
  -F "description=Sản phẩm bị lỗi" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Quy tắc validation

- **File types:** jpg, jpeg, png, gif, webp
- **File size:** Tối đa 5MB/file
- **Số lượng:** Tối đa 5 hình ảnh/lần upload
- **Tối đa 5 hình ảnh/role** cho mỗi sản phẩm hoàn hàng

## Transformation

Hình ảnh được tự động transform khi upload:

- Width/Height: Max 1200x1200 (maintain aspect ratio)
- Quality: Auto
- Crop: Limit

## Folder structure trên Cloudinary

```
return-exchange-images/
  ├── customer/
  │   └── {returnExchangeItemId}/
  │       ├── image1.jpg
  │       └── image2.jpg
  ├── sales/
  │   └── {returnExchangeItemId}/
  │       └── image1.jpg
  └── operation/
      └── {returnExchangeItemId}/
          └── image1.jpg
```

## Lưu ý bảo mật

- **KHÔNG** commit file `.env` vào Git
- Thêm `.env` vào `.gitignore`
- Sử dụng environment variables trong production
- Rotate API credentials định kỳ
- Giới hạn quyền truy cập Cloudinary account

## Troubleshooting

### Lỗi: "Invalid signature"

- Kiểm tra lại CloudName, ApiKey, ApiSecret
- Đảm bảo không có khoảng trắng thừa

### Lỗi: "Upload failed"

- Kiểm tra kết nối internet
- Kiểm tra file size và type
- Xem logs chi tiết trong Cloudinary Dashboard

### Lỗi: "Quota exceeded"

- Free plan có giới hạn 25GB storage và bandwidth
- Upgrade plan hoặc xóa ảnh cũ không dùng

## Tài liệu tham khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [CloudinaryDotNet SDK](https://github.com/cloudinary/CloudinaryDotNet)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
