# Quy trình hoàn hàng (Return Exchange Process)

## Tổng quan

Hệ thống hỗ trợ quy trình hoàn hàng chi tiết với minh bạch hóa bằng hình ảnh, phân quyền xử lý theo vai trò (Customer, Sales, Operation).

## Các tính năng chính

### 1. Hoàn trả từng sản phẩm

- Một đơn hàng có thể có nhiều sản phẩm, khách hàng có thể chọn hoàn trả từng sản phẩm cụ thể
- Mỗi sản phẩm có thể có lý do hoàn trả riêng

### 2. Minh bạch bằng hình ảnh

- Mỗi vai trò (Customer, Sales, Operation) có thể upload tối đa 5 hình ảnh cho mỗi sản phẩm hoàn
- Hình ảnh giúp minh chứng tình trạng sản phẩm ở từng bước xử lý

### 3. Lịch sử xử lý đầy đủ

- Mọi thao tác được ghi nhận với thông tin: ai, khi nào, hành động gì
- Dễ dàng truy vết và kiểm tra

## Luồng xử lý

### Bước 1: Khách hàng tạo yêu cầu hoàn hàng

- **Endpoint**: `POST /api/ReturnExchange`
- **Body**:

```json
{
  "orderId": "guid",
  "reason": "Lý do hoàn hàng",
  "items": [
    {
      "orderItemId": "guid",
      "quantity": 1,
      "reason": "Lý do cụ thể cho sản phẩm này",
      "imageUrls": ["url1", "url2", "url3"]
    }
  ]
}
```

- **Trạng thái**: `Pending`

### Bước 2: Sales kiểm tra và phê duyệt

- **Endpoint**: `POST /api/ReturnExchange/review`
- **Body**:

```json
{
  "returnExchangeId": "guid",
  "isApproved": true,
  "comment": "Nhận xét của Sales",
  "images": [
    {
      "returnExchangeItemId": "guid",
      "imageUrls": ["url1", "url2"],
      "description": "Mô tả hình ảnh"
    }
  ]
}
```

- **Trạng thái**: `ApprovedBySales` hoặc `Rejected`

### Bước 3: Operation nhận và xử lý hàng hoàn

- **Endpoint**: `POST /api/ReturnExchange/receive`
- **Body**:

```json
{
  "returnExchangeId": "guid",
  "comment": "Nhận xét của Operation",
  "items": [
    {
      "returnExchangeItemId": "guid",
      "status": "Received",
      "note": "Ghi chú về tình trạng thực tế",
      "imageUrls": ["url1", "url2", "url3"]
    }
  ]
}
```

- **Trạng thái**: `ReceivedByOperation`

## Các trạng thái (Status)

- **Pending**: Chờ Sales xem xét
- **ApprovedBySales**: Đã được Sales phê duyệt, chờ Operation xử lý
- **Rejected**: Bị từ chối bởi Sales
- **ReceivedByOperation**: Đã được Operation nhận và xử lý
- **Completed**: Hoàn tất (hoàn tiền/đổi hàng)

## Cấu trúc dữ liệu

### Entities

- **ReturnExchange**: Yêu cầu hoàn hàng (liên kết với Order)
- **ReturnExchangeItem**: Sản phẩm cụ thể được hoàn (liên kết với OrderItem)
- **ReturnExchangeImage**: Hình ảnh minh chứng (tối đa 5 ảnh/role/item)
- **ReturnExchangeHistory**: Lịch sử xử lý

### API Endpoints

- `POST /api/ReturnExchange` - Tạo yêu cầu hoàn hàng (Customer)
- `GET /api/ReturnExchange/{id}` - Xem chi tiết yêu cầu hoàn hàng
- `GET /api/ReturnExchange/customer/{customerId}` - Danh sách yêu cầu của khách hàng
- `GET /api/ReturnExchange/pending` - Danh sách chờ xử lý (Sales)
- `GET /api/ReturnExchange/approved` - Danh sách đã phê duyệt (Operation)
- `POST /api/ReturnExchange/review` - Xem xét và phê duyệt (Sales)
- `POST /api/ReturnExchange/receive` - Nhận và xử lý hàng hoàn (Operation)
- `POST /api/ReturnExchange/images` - Thêm hình ảnh

## Migration

Migration đã được tạo: `AddReturnExchangeEnhancements`

Để áp dụng migration vào database:

```bash
dotnet ef database update --project DataAccessLayer --startup-project GlassesManagementSystem
```

## Lưu ý

- Hiện tại các endpoint đang sử dụng Guid giả cho userId. Cần thay thế bằng userId thực từ JWT authentication.
- Cần triển khai upload hình ảnh (file storage service) và trả về URL.
- Có thể bổ sung thêm logic hoàn tiền, cập nhật kho hàng tùy thuộc vào yêu cầu nghiệp vụ.
