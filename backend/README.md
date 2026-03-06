# Danh sách API Backend & Mục đích sử dụng

Tài liệu này tổng hợp toàn bộ các API hiện có trong backend `GlassesManagementSystem` và mô tả ngắn gọn chức năng của từng endpoint, được phân chia theo từng controller.

---

## 1. Auth (Xác thực & Người dùng)

**Controller:** `AuthController`

- `POST /api/Auth/login` – Đăng nhập bằng email và mật khẩu, trả về thông tin user và JWT.
- `POST /api/Auth/register` – Đăng ký tài khoản Customer mới, trả về JWT.

---

## 2. Public Product (Sản phẩm cho người dùng)

**Controller:** `PublicProductController` (Không yêu cầu đăng nhập)

- `GET /api/products` – Lấy danh sách toàn bộ sản phẩm (gọng kính, tròng kính...).
- `GET /api/products/{id}` – Lấy chi tiết một sản phẩm.
- `GET /api/products/categories` – Lấy danh sách danh mục sản phẩm.
- `GET /api/products/brands` – Lấy danh sách thương hiệu.
- `GET /api/products/frame-variants` – Lấy danh sách biến thể gọng kính (kèm `?productId=...`).
- `GET /api/products/frame-variants/{id}` – Lấy chi tiết một biến thể gọng kính.
- `GET /api/products/lens-variants` – Lấy danh sách biến thể tròng kính.
- `GET /api/products/lens-variants/{id}` – Lấy chi tiết một biến thể tròng kính.

---

## 3. Prescription (Quản lý Đơn đo kính/Thông số gọng)

**Controller:** `PrescriptionController`

- `POST /api/Prescription` _(Customer)_ – Khách hàng tạo form thông số gọng/kính mới.
- `GET /api/Prescription` _(Customer)_ – Khách hàng xem danh sách đơn của mình.
- `GET /api/Prescription/all` _(Staff)_ – Nhân viên xem toàn bộ đơn của toàn hệ thống chờ xử lý.
- `GET /api/Prescription/{id}` _(Customer, Staff)_ – Lấy chi tiết một đơn.
- `PUT /api/Prescription/{id}` _(Customer)_ – Cập nhật đơn khi chưa được duyệt.
- `PATCH /api/Prescription/{id}/confirm` _(Staff)_ – Staff duyệt xác nhận thông số hợp lệ, **hệ thống tự tạo Order**.
- `PATCH /api/Prescription/{id}/reject` _(Staff)_ – Staff từ chối đơn kèm lý do.

---

## 4. Cart (Giỏ hàng)

**Controller:** `CartController` _(Customer)_

- `GET /api/Cart` – Lấy thông tin giỏ hàng của Customer đang đăng nhập.
- `POST /api/Cart/create` – Khởi tạo giỏ hàng nếu chưa có.
- `POST /api/Cart/items` – Thêm 1 item vào giỏ (Product, Combo, Lens, Service...).
- `PUT /api/Cart/items/{cartItemId}` – Thay đổi số lượng của 1 mục trong giỏ.
- `DELETE /api/Cart/items/{cartItemId}` – Xoá 1 mục khỏi giỏ.

---

## 5. Order (Đơn hàng)

**Controller:** `OrderController`

- `GET /api/Order/orders` _(Operation, Staff)_ – Xem danh sách toàn bộ đơn hàng.
- `GET /api/Order/customer` _(Customer)_ – Xem lịch sử đơn hàng của mình.
- `GET /api/Order/{orderId}` _(Customer, Staff, Operation)_ – Lấy chi tiết thông tin 1 đơn hàng.
- `POST /api/Order/from-cart` _(Customer)_ – Tạo đơn hàng (Checkout) từ những món có trong giỏ hàng.
- `POST /api/Order/manual` _(Customer)_ – Mua ngay một sản phẩm (không thông qua giỏ).
- `PATCH /api/Order/{orderId}/status` _(Operation)_ – Cập nhật trạng thái giao hàng (`Processing`, `Shipped`, `Delivered`).
- `PATCH /api/Order/{orderId}/cancel` _(Customer)_ – Khách tự huỷ đơn.
- `PATCH /api/Order/{orderId}/confirm` _(Staff)_ – Nhân viên chốt/duyệt đơn.
- `PATCH /api/Order/{orderId}/reject` _(Staff)_ – Nhân viên từ chối/hủy đơn.

---

## 6. Payment (Thanh toán MOMO)

**Controller:** `PaymentController`

- `POST /api/Payment/momo` – Tạo PayUrl của Momo bắt đầu quy trình thanh toán.
- `GET /api/Payment/momo-callback` – Đường dẫn Momo redirect user quay lại Web Frontend (xác thực tạm/chuyển trang).
- `POST /api/Payment/momo-notify` – Webhook Server-to-Server để Momo báo IPN cập nhật trạng thái đơn (thành công/thất bại).

---

## 7. Return & Exchange (Đổi/Trả hàng)

**Controller:** `ReturnExchangeController`

- `POST /api/ReturnExchange` _(Customer)_ – Tạo yêu cầu báo lỗi/đổi/trả hàng.
- `GET /api/ReturnExchange/{id}` – Xem chi tiết yêu cầu báo lỗi.
- `GET /api/ReturnExchange/customer` _(Customer)_ – Lấy danh sách đổi trả của bản thân.
- `GET /api/ReturnExchange/pending` _(Staff)_ – Staff xem danh sách đổi trả chờ duyệt đầu tiên.
- `GET /api/ReturnExchange/approved` _(Operation)_ – Xem danh sách đã cho phép hoàn gửi lại về kho.
- `POST /api/ReturnExchange/review` _(Staff)_ – Staff duyệt nhanh hoặc từ chối yêu cầu đổi/trả.
- `POST /api/ReturnExchange/receive` _(Operation)_ – Xác nhận kỹ thuật/chất lượng khi nhận hàng tại kho.
- `POST /api/ReturnExchange/upload-images` – Upload ảnh minh chứng lên Cloudinary.
- `POST /api/ReturnExchange/images` – Lưu URL ảnh minh chứng vào Database.

---

## 8. Manager - Phân hệ Quản lý cấp cao (Cho Admin, Manager)

Các module sau thường truy cập qua Base Path: `/api/manager/...`

### 8.1 Product Manager (Khác biệt so với Public, hỗ trợ C.R.U.D đầy đủ)

**Controller:** `ProductManagerController`

- `GET, POST, PUT, DELETE` - `/api/manager/products` – Quản lý thông tin sản phẩm.
- `GET, POST, PUT, DELETE` - `/api/manager/products/categories` – Quản lý danh mục.
- `GET, POST, PUT, DELETE` - `/api/manager/products/brands` – Quản lý thương hiệu.
- `GET, POST, PUT, DELETE` - `/api/manager/products/frame-variants` – Quản lý biến thể gọng.
- `GET, POST, PUT, DELETE` - `/api/manager/products/lens-variants` – Quản lý biến thể tròng.

### 8.2 Pricing & Promotions

**Controller:** `PricingPromotionController`

- `GET, POST, PUT, DELETE` - `/api/manager/pricing-promotions/promotions` – Quản lý khuyến mãi.
- `GET, POST, PUT, DELETE` - `/api/manager/pricing-promotions/services` – Quản lý giá dịch vụ (vd: đo mắt).
- `PATCH /api/manager/pricing-promotions/services/{id}/price` – Sửa nhanh giá dịch vụ.
- `GET, POST, PUT, DELETE` - `/api/manager/pricing-promotions/combos` – Quản lý các combo cắt kính.
- `GET, POST, DELETE` - `/api/manager/pricing-promotions/combos/{comboId}/items` – Setup sản phẩm bên trong combo đó.

### 8.3 Return/Exchange Manager

**Controller:** `ReturnExchangeManagerController`

- `GET /api/manager/return-exchanges/pending` – Lấy yêu cầu đổi/trả Pending.
- `GET /api/manager/return-exchanges/approved` – Lấy yêu cầu đã duyệt qua Staff.
- `GET /api/manager/return-exchanges/{id}` – Lấy chi tiết quyết định đổi trả.
- `POST /api/manager/return-exchanges/review` – Manager Chốt duyệt đổi trả cuối cùng (quyết định theo chính sách/tiền).

### 8.4 Revenue (Báo cáo & Thống kê doanh thu)

**Controller:** `RevenueController`

- `GET /api/manager/revenue/overview` – Lấy tổng quan doanh thu (theo Range ngày).
- `GET /api/manager/revenue/monthly/{year}` – Doanh thu chi tiết từng tháng trong Năm.
- `GET /api/manager/revenue/recent-orders` – Hiển thị N đơn hàng mới nhất đặt.
- `GET /api/manager/revenue/payments` – Thống kê luồng đối soát payment.
- `GET /api/manager/revenue/return-exchange-impact` – Impact đánh giá số tiền hoàn hoặc chịu thiệt khi người dùng trả hàng.

### 8.5 Users / Staff Management

**Controller:** `UserStaffController`

- `GET /api/manager/users` – Lấy danh sách tài khoản toàn hệ thống.
- `GET /api/manager/users/{id}` – Xem chi tiết 1 người dùng.
- `POST /api/manager/users` – Khởi tạo tài khoản nhân viên/mới.
- `PUT /api/manager/users/{id}` – Cập nhật info nhân viên.
- `DELETE /api/manager/users/{id}` – Xoá account.
- `PATCH /api/manager/users/{id}/status` – Ban (Khóa) hoặc Mở khóa tài khoản người dùng/nhân viên.

### 8.6 Warranty Policies (Chính sách Bảo hành)

**Controller:** `WarrantyPolicyController`

- `GET, POST, PUT, DELETE` - `/api/manager/policies` – Cấu hình các điều khoản, thời gian bảo hành cho sản phẩm/nhóm sản phẩm.

---

# Cấu trúc Hệ thống & Kiến trúc Backend

Dự án này được xây dựng dựa trên mô hình **Kiến trúc 3 lớp (3-Tier Architecture)** sử dụng .NET Core / C#. Mỗi lớp đảm nhiệm một vai trò riêng biệt, giúp code dễ đọc, dễ bảo trì, và dễ nâng cấp.

## Sơ đồ tổng quan (N-Tier Architecture)

```text
[ Frontend (Next.js) ]
         │ (HTTP / JSON)
         ▼
┌───────────────────────────────────────┐
│     Lớp Triển khai (API Layer)        │ ──> Project: GlassesManagementSystem
│  (Controllers, Middlewares, Auth)     │
└───────────────────────────────────────┘
         │ (Gọi Interfaces)
         ▼
┌───────────────────────────────────────┐
│  Lớp Nghiệp vụ (Business Logic Layer) │ ──> Project: BusinessLogicLayer
│  (Services, DTOs, Validation, Mappers)│
└───────────────────────────────────────┘
         │ (Gọi IUnitOfWork, Repositories)
         ▼
┌────────────────────────────────────────┐
│ Lớp Truy xuất Dữ liệu (DataAccessLayer)│ ──> Project: DataAccessLayer
│ (Entities, DbContext, Repositories)    │
└────────────────────────────────────────┘
         │ (SQL Server)
         ▼
      [ Database ]
```

## Chi tiết từng tầng (Layers)

### 1. Tầng Triển khai (Web API Layer)

**Tên Project:** `GlassesManagementSystem`

- **Chức năng chính:** Điểm vào (entry point) của hệ thống. Nhận HTTP Requests, kiểm tra xác thực/phân quyền và trả về HTTP Responses.
- **Thành phần:** `Controllers`, cấu hình DI/JWT/Cors (`Program.cs`), `Middlewares`.

### 2. Tầng Nghiệp vụ (Business Logic Layer - BLL)

**Tên Project:** `BusinessLogicLayer`

- **Chức năng chính:** Trái tim của hệ thống. Chứa toàn bộ quy tắc nghiệp vụ, tính toán và biến đổi dữ liệu.
- **Thành phần:** `Services` (Interfaces / Implementations), `DTOs` (Requests/Responses), Integrations (MomoService, CloudinaryService...).

### 3. Tầng Truy cập Dữ liệu (Data Access Layer - DAL)

**Tên Project:** `DataAccessLayer`

- **Chức năng chính:** Giao tiếp trực tiếp với SQL Server thông qua Entity Framework Core.
- **Thành phần:** `Entities` (class ánh xạ bảng DB), `ApplicationDbContext`, `Repositories` (UnitOfWork Pattern).

---

# Luồng hoạt động: Custom Prescription (Đơn cắt kính theo yêu cầu)

Quy trình đầy đủ từ lúc khách hàng cung cấp thông số gọng kính cho đến khi Operation hoàn thành sản xuất và giao hàng.

## Sơ đồ luồng

```text
[Customer]                  [Staff/Saler]                    [Operation]
    │                             │                                │
    │  (1) Gửi Form Prescription  │                                │
    │─────────────────────────────►                                │
    │  Status: PrescriptionPending│                                │
    │                             │                                │
    │                             │  (2) Xem danh sách Prescription│
    │                             │      Tư vấn chọn Gọng + Tròng  │
    │                             │      Nhập địa chỉ giao hàng    │
    │                             │      → Bấm "Xác nhận"          │
    │                             │      API: PATCH /confirm        │
    │                             │                                │
    │                             │  Hệ thống tự tạo Order mới     │
    │                             │  Status: PrescriptionConfirmed │
    │                             │  Order.Status = "Confirmed"    │
    │                             │──────────────────────────────►│
    │                             │                                │
    │                             │             (3) Nhận đơn hàng │
    │                             │             Mài tròng & ráp gọng│
    │                             │             → Cập nhật trạng thái│
    │                             │             Processing → Shipped│
    │                             │             → Delivered        │
```

## Bước 1: Customer gửi yêu cầu

- **API:** `POST /api/Prescription`
- **Action:** Khách hàng điền thông số gọng (CK, BL, VG, CVM, CG, ĐG), chọn Dịch vụ, gửi form.
- **Kết quả:** Bản ghi Prescription status = `PrescriptionPending`.

## Bước 2: Staff (Saler) xác thực & tạo Order

- **Giao diện:** `/staff/prescriptions` — Danh sách đơn chờ duyệt.
- **Action:** Staff bấm **"Xác nhận"**, form modal hiện ra để:
  - Chọn **Gọng kính** (Product + ProductVariant)
  - Chọn **Tròng kính** (Product + LensVariant)
  - Nhập **Địa chỉ** & **SĐT** giao hàng
  - Thêm ghi chú nếu cần
- **API:** `PATCH /api/Prescription/{id}/confirm` body gồm `ProductVariantId`, `LensesVariantId`, `ShippingAddress`, `ShippingPhone`.
- **Kết quả:** `Prescription.status` = `PrescriptionConfirmed`. Hệ thống **tự động tạo Order** bao gồm món hàng đã chọn với giá tổng = framePrice + lensPrice.

## Bước 3: Operation sản xuất & cập nhật giao hàng

- **Giao diện:** `/staff/orders` — Xem đơn hàng mới với trạng thái `Confirmed`.
- **Action:** Operation cập nhật trạng thái qua API theo tiến độ:
  1. Bắt đầu làm: `Confirmed` → `Processing`
  2. Giao đơn vị vận chuyển: `Processing` → `Shipped`
  3. Khách xác nhận nhận hàng: `Shipped` → `Delivered`
- **API:** `PATCH /api/Order/{orderId}/status`

## Trạng thái hệ thống

| Trạng thái              | Ý nghĩa                                  |
| ----------------------- | ---------------------------------------- |
| `PrescriptionPending`   | Đơn thông số mới, chờ Staff duyệt        |
| `PrescriptionConfirmed` | Đã duyệt, Order được tạo                 |
| `PrescriptionRejected`  | Bị từ chối                               |
| `Confirmed` (Order)     | Staff đã xác nhận, Operation bắt đầu làm |
| `Processing` (Order)    | Đang sản xuất/chuẩn bị                   |
| `Shipped` (Order)       | Đã giao cho đơn vị vận chuyển            |
| `Delivered` (Order)     | Khách đã nhận                            |
