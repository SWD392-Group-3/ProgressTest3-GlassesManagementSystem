# Kế hoạch tính năng: Đổi trả đơn hàng (Customer → Staff → Operations)

## 1. Tổng quan luồng nghiệp vụ

```
Customer yêu cầu đổi trả đơn hàng
        ↓
Staff (Sales) tiếp nhận & phê duyệt/từ chối
        ↓
Chuyển giao tới Operations
        ↓
Operations kiểm tra sản phẩm & cập nhật trạng thái (sản phẩm thường + kính custom)
        ↓
Hoàn tất đơn đổi trả
```

Hệ thống hỗ trợ đổi trả cho **sản phẩm kính thường** (Product/ProductVariant) và **sản phẩm kính custom theo ý người dùng** (lưu trữ tại bảng **Prescription**).

### 1.1 Quy tắc nghiệp vụ – Điều kiện đổi trả

**Khi người dùng (khách hàng) có đơn hàng thì được phép yêu cầu đổi trả những sản phẩm trong đơn hàng đó nếu có vấn đề về sản phẩm.**

- Khách hàng chỉ được tạo yêu cầu đổi trả cho **sản phẩm thuộc đơn hàng của chính mình** (Order thuộc Customer đó).
- Khách chọn **một hoặc nhiều dòng sản phẩm** (OrderItem) trong đơn để đổi/trả, kèm lý do và có thể đính kèm ảnh minh chứng (vấn đề về sản phẩm).
- Các bước tiếp theo (Staff tiếp nhận → chuyển Operations → kiểm tra & cập nhật trạng thái) áp dụng cho toàn bộ yêu cầu đó.

---

## 2. Bốn bảng Entities hỗ trợ đổi trả

### 2.1 ReturnExchange

| Mục                  | Nội dung                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vai trò**          | Đại diện một **yêu cầu đổi/trả** gắn với một đơn hàng và một khách hàng.                                                                      |
| **Bảng**             | `RETURN_EXCHANGES`                                                                                                                            |
| **Thuộc tính chính** | `Id`, `OrderId`, `CustomerId`, `Reason`, `Status`, `RejectionReason`, `CreatedAt`, `ReviewedBySalesAt`, `ReceivedByOperationAt`, `ResolvedAt` |
| **Status**           | `Pending` → `ApprovedBySales` \| `Rejected` → `ReceivedByOperation` → (cần thêm) `Completed`                                                  |
| **Quan hệ**          | 1 Order, 1 Customer; 1–n ReturnExchangeItem; 1–n ReturnExchangeHistory                                                                        |

### 2.2 ReturnExchangeItem

| Mục                  | Nội dung                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Vai trò**          | Từng **dòng sản phẩm** trong yêu cầu đổi trả (liên kết với một OrderItem: sản phẩm thường hoặc kính custom).            |
| **Bảng**             | `RETURN_EXCHANGE_ITEMS`                                                                                                 |
| **Thuộc tính chính** | `Id`, `ReturnExchangeId`, `OrderItemId`, `Quantity`, `Reason`, `Status`, `Note`, `CreatedAt`                            |
| **Status**           | `Pending` → `Approved` \| `Rejected` (Sales) → `Received` (Operations)                                                  |
| **Quan hệ**          | 1 ReturnExchange, 1 OrderItem; 1–n ReturnExchangeImage. **(Đề xuất thêm:** `InspectionResult` để lưu kết quả kiểm tra.) |

### 2.3 ReturnExchangeImage

| Mục                  | Nội dung                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Vai trò**          | Lưu **ảnh minh chứng** theo từng dòng đổi trả (khách hàng / Sales / Operations upload).                     |
| **Bảng**             | `RETURN_EXCHANGE_IMAGES`                                                                                    |
| **Thuộc tính chính** | `Id`, `ReturnExchangeItemId`, `ImageUrl`, `UploadedByRole`, `UploadedByUserId`, `UploadedAt`, `Description` |
| **Quan hệ**          | N–1 ReturnExchangeItem                                                                                      |

### 2.4 ReturnExchangeHistory

| Mục                  | Nội dung                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Vai trò**          | **Lịch sử thao tác** trên yêu cầu đổi trả (audit trail).                                                                       |
| **Thuộc tính chính** | `Id`, `ReturnExchangeId`, `Action`, `OldStatus`, `NewStatus`, `Comment`, `PerformedByUserId`, `PerformedByRole`, `PerformedAt` |
| **Quan hệ**          | N–1 ReturnExchange                                                                                                             |

---

## 3. Dữ liệu sản phẩm: Sản phẩm thường vs Kính custom (Prescription)

### 3.1 Sản phẩm thường (kính không custom)

- **OrderItem** có `ProductVariantId` (và qua ProductVariant → **Product**).
- Trạng thái kho/tồn: **Product.Status**, **ProductVariant.Status**.
- Khi Operations kiểm tra hàng hoàn: cần **cập nhật Product/ProductVariant** theo kết quả kiểm tra.

### 3.2 Sản phẩm kính custom (theo ý người dùng)

- **Kính custom được lưu trữ ở bảng Prescription.**
- **Prescription**: `Id`, `CustomerId`, `ServiceId`, các thông số kỹ thuật (CangKinh, BanLe, VienGong, ChanVeMui, CauGong, DuoiGong), `Note`, `CreatedAt`.
- **Quan hệ hiện tại**: Prescription thuộc Customer + Service; **OrderItem** có `ServiceId` (dịch vụ/kính custom) nhưng **chưa có** `PrescriptionId`.
- **Kết nối gián tiếp**: Đơn hàng có `CustomerId`, OrderItem có `ServiceId` → có thể suy ra Prescription qua (CustomerId, ServiceId). Để rõ ràng và dễ cập nhật trạng thái sau đổi trả, **nên bổ sung** `PrescriptionId` vào OrderItem (xem Phase 1).

### 3.3 Cập nhật trạng thái sau kiểm tra (Operations)

- **Item là sản phẩm thường** (OrderItem.ProductVariantId != null): cập nhật **ProductVariant.Status** (và có thể **Product.Status** theo quy tắc nghiệp vụ).
- **Item là kính custom** (OrderItem.ServiceId != null, và có PrescriptionId hoặc tra qua CustomerId + ServiceId): cập nhật **Prescription** (cần thêm trường **Status** trên Prescription để phản ánh trạng thái sau kiểm tra: ví dụ Available, Returned, Defective, NeedRepair).

---

## 4. Workflow hoạt động chi tiết – Trạng thái, lưu trữ dữ liệu và chuyển dữ liệu giữa các bảng

Phần này mô tả từng bước trong luồng đổi trả: **hành động**, **bảng/trường nào được ghi hoặc cập nhật**, và **dữ liệu chuyển từ bảng nào sang bảng nào**.

---

### 4.1 Bước 1: Khách hàng tạo yêu cầu đổi trả

| Mục           | Chi tiết                                                                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hành động** | Customer gửi yêu cầu đổi/trả đơn hàng: chọn đơn (OrderId), lý do chung (Reason), danh sách sản phẩm cần đổi trả (OrderItemId, Quantity, Reason từng dòng) và có thể đính kèm ảnh. |
| **API**       | `POST /api/ReturnExchange` — body: `CreateReturnExchangeRequest` (OrderId, Reason, Items[], mỗi item có OrderItemId, Quantity, Reason, ImageUrls).                                |
| **Điều kiện** | Order tồn tại và thuộc Customer; Items không rỗng; mỗi item tối đa 5 ảnh.                                                                                                         |

**Lưu trữ dữ liệu (INSERT):**

| Bảng                        | Thao tác                      | Dữ liệu lưu / nguồn                                                                                                                                                                                                                 |
| --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RETURN_EXCHANGES**        | INSERT 1 bản ghi              | `Id` (mới), `OrderId` ← từ request, `CustomerId` ← từ auth/context, `Reason` ← request, `Status = "Pending"`, `CreatedAt = UtcNow`. Các cột còn lại (RejectionReason, ReviewedBySalesAt, ReceivedByOperationAt, ResolvedAt) = null. |
| **RETURN_EXCHANGE_ITEMS**   | INSERT n bản ghi (1 per item) | Mỗi dòng: `Id` (mới), `ReturnExchangeId` ← vừa tạo, `OrderItemId` ← từ request.Items[].OrderItemId, `Quantity`, `Reason` ← request, `Status = "Pending"`, `CreatedAt = UtcNow`.                                                     |
| **RETURN_EXCHANGE_IMAGES**  | INSERT theo từng ảnh          | `ReturnExchangeItemId` ← item tương ứng, `ImageUrl` ← request (hoặc URL sau upload), `UploadedByRole = "Customer"`, `UploadedByUserId = CustomerId`, `UploadedAt = UtcNow`.                                                         |
| **RETURN_EXCHANGE_HISTORY** | INSERT 1 bản ghi              | `ReturnExchangeId` ← vừa tạo, `Action = "Created"`, `NewStatus = "Pending"`, `Comment` (mô tả), `PerformedByUserId = CustomerId`, `PerformedByRole = "Customer"`, `PerformedAt = UtcNow`.                                           |

**Chuyển dữ liệu giữa các bảng:**

- **Order** → **ReturnExchange**: `Order.Id` → `ReturnExchange.OrderId`; thông tin đơn được tham chiếu, không copy field khác.
- **Customer** (context) → **ReturnExchange**: `Customer.Id` → `ReturnExchange.CustomerId`.
- **OrderItem** (đã tồn tại trong đơn) → **ReturnExchangeItem**: `OrderItem.Id` → `ReturnExchangeItem.OrderItemId`; mỗi dòng đổi trả gắn với đúng một dòng trong đơn.

---

### 4.2 Bước 2: Staff (Sales) tiếp nhận và phê duyệt / từ chối

| Mục           | Chi tiết                                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hành động** | Sales xem danh sách yêu cầu chờ (`Status = Pending`), mở chi tiết, phê duyệt hoặc từ chối; có thể thêm ảnh/ghi chú.                                                                                                                     |
| **API**       | `GET /api/ReturnExchange/pending` (danh sách), `GET /api/ReturnExchange/{id}` (chi tiết), `POST /api/ReturnExchange/review` — body: `ReviewReturnExchangeRequest` (ReturnExchangeId, IsApproved, RejectionReason?, Comment?, Images[]). |
| **Điều kiện** | ReturnExchange tồn tại và `Status = "Pending"`.                                                                                                                                                                                         |

**Lưu trữ dữ liệu (UPDATE + INSERT):**

| Bảng                        | Thao tác                   | Dữ liệu lưu / nguồn                                                                                                                                                                                                          |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RETURN_EXCHANGES**        | UPDATE 1 bản ghi           | Nếu duyệt: `Status = "ApprovedBySales"`, `ReviewedBySalesAt = UtcNow`. Nếu từ chối: `Status = "Rejected"`, `RejectionReason` ← request, `ResolvedAt = UtcNow`.                                                               |
| **RETURN_EXCHANGE_IMAGES**  | INSERT (nếu Sales gửi ảnh) | Giống Bước 1 nhưng `UploadedByRole = "Sales"`, `UploadedByUserId = SalesUserId`, có thể có `Description`.                                                                                                                    |
| **RETURN_EXCHANGE_HISTORY** | INSERT 1 bản ghi           | `Action = "ApprovedBySales"` hoặc `"RejectedBySales"`, `OldStatus = "Pending"`, `NewStatus` = giá trị mới của ReturnExchange, `Comment` ← request, `PerformedByUserId`, `PerformedByRole = "Sales"`, `PerformedAt = UtcNow`. |

**Chuyển dữ liệu giữa các bảng:**

- Không có bảng khác (Order, OrderItem, Product, Prescription) bị cập nhật ở bước này. Chỉ cập nhật **ReturnExchange** và bổ sung **ReturnExchangeHistory** + **ReturnExchangeImage** (ảnh Sales).

---

### 4.3 Bước 3: Chuyển giao tới Operations – Nhận hàng, kiểm tra, cập nhật trạng thái từng item

| Mục           | Chi tiết                                                                                                                                                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hành động** | Operations nhận hàng vật lý, kiểm tra từng sản phẩm (thường hoặc kính custom), nhập kết quả kiểm tra (InspectionResult), ghi chú và ảnh; hệ thống cập nhật trạng thái từng dòng và **chuyển kết quả kiểm tra sang bảng sản phẩm** (Product/ProductVariant hoặc Prescription). |
| **API**       | `GET /api/ReturnExchange/approved` (danh sách), `POST /api/ReturnExchange/receive` — body: `ReceiveReturnExchangeRequest` (ReturnExchangeId, Comment, Items[]: ReturnExchangeItemId, Status, Note, ImageUrls?, **InspectionResult**).                                         |
| **Điều kiện** | ReturnExchange tồn tại và `Status = "ApprovedBySales"`.                                                                                                                                                                                                                       |

**Lưu trữ dữ liệu (UPDATE + INSERT):**

| Bảng                                               | Thao tác                                    | Dữ liệu lưu / nguồn                                                                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RETURN_EXCHANGES**                               | UPDATE 1 bản ghi                            | `Status = "ReceivedByOperation"`, `ReceivedByOperationAt = UtcNow`. (Sau khi xử lý hết item có thể chuyển tiếp sang `Completed`, `ResolvedAt` — xem Bước 4.)                                               |
| **RETURN_EXCHANGE_ITEMS**                          | UPDATE từng bản ghi tương ứng request.Items | `Status` ← request (ví dụ `"Received"`), `Note` ← request, **`InspectionResult`** ← request (Available / Defective / Damaged / NeedRepair).                                                                |
| **RETURN_EXCHANGE_IMAGES**                         | INSERT (nếu Operations gửi ảnh)             | `UploadedByRole = "Operation"`, `UploadedByUserId = OperationUserId`, `UploadedAt = UtcNow`.                                                                                                               |
| **RETURN_EXCHANGE_HISTORY**                        | INSERT 1 bản ghi                            | `Action = "ReceivedByOperation"`, `OldStatus = "ApprovedBySales"`, `NewStatus = "ReceivedByOperation"`, `Comment` ← request, `PerformedByUserId`, `PerformedByRole = "Operation"`, `PerformedAt = UtcNow`. |
| **PRODUCT_VARIANTS** (khi item là sản phẩm thường) | UPDATE                                      | Lấy ProductVariant qua **ReturnExchangeItem → OrderItem → ProductVariantId**. Gán `ProductVariant.Status = InspectionResult` (và có thể `UpdatedAt`).                                                      |
| **PRODUCTS** (tùy quy tắc nghiệp vụ)               | UPDATE                                      | Có thể cập nhật `Product.Status` theo cùng InspectionResult hoặc quy tắc đồng bộ từ ProductVariant.                                                                                                        |
| **PRESCRIPTIONS** (khi item là kính custom)        | UPDATE                                      | Lấy Prescription qua **OrderItem.PrescriptionId** (hoặc Order.CustomerId + OrderItem.ServiceId). Gán `Prescription.Status = InspectionResult`, `Prescription.UpdatedAt = UtcNow`.                          |

**Chuyển dữ liệu giữa các bảng:**

- **ReturnExchangeItem** → **OrderItem**: dùng `ReturnExchangeItem.OrderItemId` để lấy OrderItem.
- **OrderItem** → **ProductVariant / Product**: `OrderItem.ProductVariantId` → ProductVariant; ProductVariant.ProductId → Product. **InspectionResult** (từ request → lưu vào ReturnExchangeItem) được **copy/áp dụng** sang `ProductVariant.Status` (và có thể `Product.Status`).
- **OrderItem** → **Prescription**: `OrderItem.PrescriptionId` (hoặc cặp Order.CustomerId + OrderItem.ServiceId) → Prescription. **InspectionResult** được **copy/áp dụng** sang `Prescription.Status` (và `Prescription.UpdatedAt`).

---

### 4.4 Bước 4: Hoàn tất đơn đổi trả

| Mục           | Chi tiết                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hành động** | Sau khi Operations đã xử lý xong tất cả item (mọi ReturnExchangeItem ở trạng thái đã nhận, ví dụ `Received`), hệ thống đánh dấu yêu cầu đổi trả kết thúc.    |
| **API**       | Có thể thực hiện **trong cùng** `POST /api/ReturnExchange/receive` (sau khi cập nhật hết item, kiểm tra và set Completed). Hoặc endpoint riêng tùy thiết kế. |
| **Điều kiện** | ReturnExchange.Status = "ReceivedByOperation"; mọi ReturnExchangeItem của đơn đó đã ở trạng thái đã xử lý (Received).                                        |

**Lưu trữ dữ liệu (UPDATE + INSERT):**

| Bảng                        | Thao tác         | Dữ liệu lưu / nguồn                                                                                                                                                                         |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RETURN_EXCHANGES**        | UPDATE 1 bản ghi | `Status = "Completed"`, `ResolvedAt = UtcNow`.                                                                                                                                              |
| **RETURN_EXCHANGE_HISTORY** | INSERT 1 bản ghi | `Action = "Completed"`, `OldStatus = "ReceivedByOperation"`, `NewStatus = "Completed"`, `Comment` (tùy chọn), `PerformedByUserId`, `PerformedByRole = "Operation"`, `PerformedAt = UtcNow`. |

**Chuyển dữ liệu giữa các bảng:**

- Không có bảng sản phẩm (Product, ProductVariant, Prescription) hoặc Order/OrderItem cập nhật thêm ở bước này. Chỉ kết thúc luồng trên **ReturnExchange** và ghi **ReturnExchangeHistory**.

---

### 4.5 Tổng hợp luồng dữ liệu giữa các bảng

| Hướng chuyển dữ liệu                                                     | Mô tả ngắn                                                                                                                                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Order → ReturnExchange**                                               | `Order.Id` → `ReturnExchange.OrderId` (thời điểm tạo yêu cầu).                                                                                                                                          |
| **Customer (context) → ReturnExchange**                                  | `Customer.Id` → `ReturnExchange.CustomerId`.                                                                                                                                                            |
| **OrderItem → ReturnExchangeItem**                                       | `OrderItem.Id` → `ReturnExchangeItem.OrderItemId` (mỗi dòng đổi trả gắn 1 dòng đơn).                                                                                                                    |
| **ReturnExchangeItem → ReturnExchangeImage**                             | `ReturnExchangeItem.Id` → `ReturnExchangeImage.ReturnExchangeItemId` (ảnh theo từng dòng).                                                                                                              |
| **ReturnExchange → ReturnExchangeHistory**                               | `ReturnExchange.Id` → `ReturnExchangeHistory.ReturnExchangeId` (mỗi thao tác ghi 1 dòng lịch sử).                                                                                                       |
| **ReturnExchangeItem + Request (Operations) → ProductVariant / Product** | `InspectionResult` (lưu vào ReturnExchangeItem) → cập nhật `ProductVariant.Status` (và có thể `Product.Status`) qua đường ReturnExchangeItem → OrderItem → ProductVariantId → ProductVariant → Product. |
| **ReturnExchangeItem + Request (Operations) → Prescription**             | `InspectionResult` (lưu vào ReturnExchangeItem) → cập nhật `Prescription.Status` (và UpdatedAt) qua đường ReturnExchangeItem → OrderItem → PrescriptionId (hoặc CustomerId + ServiceId) → Prescription. |

---

### 4.6 Sơ đồ tóm tắt trạng thái và bảng được ghi tại từng bước

| Bước                          | ReturnExchange.Status      | ReturnExchangeItem.Status | Bảng được INSERT                                                                         | Bảng được UPDATE                                                                                                                                                 |
| ----------------------------- | -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Customer tạo yêu cầu       | Pending                    | Pending (từng item)       | RETURN_EXCHANGES, RETURN_EXCHANGE_ITEMS, RETURN_EXCHANGE_IMAGES, RETURN_EXCHANGE_HISTORY | —                                                                                                                                                                |
| 2. Sales review               | ApprovedBySales / Rejected | (giữ nguyên)              | RETURN_EXCHANGE_IMAGES (nếu có), RETURN_EXCHANGE_HISTORY                                 | RETURN_EXCHANGES                                                                                                                                                 |
| 3. Operations nhận & kiểm tra | ReceivedByOperation        | Received (từng item)      | RETURN_EXCHANGE_IMAGES (nếu có), RETURN_EXCHANGE_HISTORY                                 | RETURN_EXCHANGES, RETURN_EXCHANGE_ITEMS (Status, Note, InspectionResult), **PRODUCT_VARIANTS**, **PRODUCTS** (nếu áp dụng), **PRESCRIPTIONS** (item kính custom) |
| 4. Hoàn tất                   | Completed                  | (giữ nguyên)              | RETURN_EXCHANGE_HISTORY                                                                  | RETURN_EXCHANGES (Status, ResolvedAt)                                                                                                                            |

---

## 5. Hiện trạng luồng & khoảng trống

### 5.1 Đã có sẵn

| Bước                                         | Mô tả                                                                                                           | API / Logic                                                                                                                     | Trạng thái |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1. Khách hàng yêu cầu đổi trả                | Tạo yêu cầu với Reason, Items (OrderItemId, Quantity, Reason, ảnh)                                              | `POST /api/ReturnExchange` → `CreateReturnExchangeAsync`                                                                        | ✅ Có      |
| 2. Staff (Sales) tiếp nhận                   | Xem danh sách chờ, phê duyệt hoặc từ chối                                                                       | `GET /api/ReturnExchange/pending`, `POST /api/ReturnExchange/review` → `ReviewReturnExchangeAsync`                              | ✅ Có      |
| 3. Chuyển giao Operations                    | Đơn đã duyệt chuyển cho Operations                                                                              | `GET /api/ReturnExchange/approved`, `POST /api/ReturnExchange/receive` → `ReceiveReturnExchangeAsync`                           | ✅ Có      |
| 4. Operations kiểm tra & cập nhật trạng thái | Nhận hàng, kiểm tra từng item, cập nhật **sản phẩm** (Product/ProductVariant) và **kính custom** (Prescription) | Chỉ cập nhật ReturnExchangeItem (Status, Note, ảnh); **không** cập nhật Product/ProductVariant; **không** động tới Prescription | ❌ Thiếu   |
| 5. Hoàn tất đơn đổi trả                      | Đánh dấu kết thúc, set ResolvedAt                                                                               | Chưa chuyển sang `Completed`, ResolvedAt chỉ set khi Rejected                                                                   | ❌ Thiếu   |

### 5.2 Khoảng trống cần bổ sung

1. **Kết quả kiểm tra (InspectionResult)**  
   Operations nhập kết quả kiểm tra từng item (ví dụ: Available, Defective, Damaged, NeedRepair). Lưu vào **ReturnExchangeItem** (đề xuất thêm cột `InspectionResult`) và dùng để cập nhật:
   - **ProductVariant / Product** (item là sản phẩm thường),
   - **Prescription** (item là kính custom).

2. **Cập nhật trạng thái Prescription**  
   Bảng Prescription hiện không có trường Status. Cần:
   - Thêm **Prescription.Status** (và UpdatedAt nếu chưa có),
   - Khi Operations xử lý item thuộc kính custom: cập nhật Prescription.Status theo InspectionResult.

3. **Liên kết rõ ràng OrderItem ↔ Prescription**  
   Để biết chính xác Prescription nào gắn với OrderItem (kính custom), nên thêm **OrderItem.PrescriptionId** (nullable). Migration + cập nhật logic tạo đơn / đổi trả.

4. **Hoàn tất đơn đổi trả**  
   Sau khi Operations xử lý xong tất cả item:
   - Set `ReturnExchange.Status = "Completed"`, `ResolvedAt = DateTime.UtcNow`,
   - Ghi `ReturnExchangeHistory` (Action = "Completed", PerformedByRole = "Operation").

---

## 6. Kế hoạch triển khai đầy đủ

### Phase 1: Chuẩn hóa dữ liệu & mở rộng Entity

| #   | Hạng mục                                 | Chi tiết                                                                                                                                                     |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 | **Trạng thái sau kiểm tra (enum/const)** | Định nghĩa giá trị cho phép: `Available`, `Defective`, `Damaged`, `NeedRepair` (hoặc theo nghiệp vụ). Dùng chung cho Product/ProductVariant và Prescription. |
| 1.2 | **ReturnExchangeItem**                   | Thêm `InspectionResult` (string, nullable, max 50) — lưu kết quả kiểm tra từng dòng. Cấu hình trong ReturnExchangeItemConfiguration.                         |
| 1.3 | **Prescription**                         | Thêm `Status` (string, nullable) và `UpdatedAt` (datetime) nếu chưa có — dùng khi cập nhật trạng thái kính custom sau đổi trả.                               |
| 1.4 | **OrderItem**                            | Thêm `PrescriptionId` (Guid?, nullable) — liên kết rõ ràng dòng đơn (kính custom) với Prescription. Cấu hình FK, OnDelete Restrict/SetNull.                  |
| 1.5 | **Migration**                            | Tạo migration EF Core cho các thay đổi trên (ReturnExchangeItem, Prescription, OrderItem).                                                                   |

### Phase 2: DTO & API Request

| #   | Hạng mục                     | Chi tiết                                                                                                                                                                                     |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | **ReceiveItemRequest**       | Thêm `InspectionResult` (string, optional) — Operations gửi kết quả kiểm tra từng item (Available, Defective, Damaged, NeedRepair).                                                          |
| 2.2 | **ReturnExchangeController** | Giữ `POST /api/ReturnExchange/receive`; request body đã hỗ trợ Items với InspectionResult. Không cần endpoint mới.                                                                           |
| 2.3 | **Validation**               | Validate InspectionResult nằm trong danh sách cho phép; với item có ProductVariantId thì bắt buộc/cho phép InspectionResult; với item có ServiceId/PrescriptionId thì cập nhật Prescription. |

### Phase 3: Logic Service – ReceiveReturnExchangeAsync

| #   | Hạng mục                        | Chi tiết                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | **Cập nhật ReturnExchangeItem** | Như hiện tại: Status, Note, ảnh; thêm gán `InspectionResult` từ request.                                                                                                                                                                                                                                              |
| 3.2 | **Item là sản phẩm thường**     | Nếu `OrderItem.ProductVariantId` có giá trị: lấy ProductVariant (và Product); cập nhật `ProductVariant.Status` (và `Product.Status` nếu quy tắc yêu cầu) = `InspectionResult`.                                                                                                                                        |
| 3.3 | **Item là kính custom**         | Nếu `OrderItem.PrescriptionId` có giá trị (sau khi thêm): lấy Prescription, cập nhật `Prescription.Status` = `InspectionResult`, `Prescription.UpdatedAt` = UtcNow. Nếu chưa có PrescriptionId: có thể tra Prescription theo Order.CustomerId + OrderItem.ServiceId (bản ghi phù hợp theo nghiệp vụ, ví dụ mới nhất). |
| 3.4 | **Hoàn tất đơn đổi trả**        | Sau khi xử lý xong tất cả item (mọi ReturnExchangeItem đã ở trạng thái Received hoặc tương đương): set `ReturnExchange.Status = "Completed"`, `ResolvedAt = DateTime.UtcNow`; thêm `ReturnExchangeHistory` (Action = "Completed", NewStatus = "Completed", PerformedByRole = "Operation").                            |

### Phase 4: Repository & DbContext

| #   | Hạng mục         | Chi tiết                                                                                                                                                            |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | **Prescription** | Đảm bảo DbSet Prescription và các repository/service cần thiết có thể load và cập nhật Prescription theo Id (và theo CustomerId + ServiceId nếu dùng cách tra cứu). |
| 4.2 | **OrderItem**    | Include ProductVariant, Product (khi có ProductVariantId), Prescription (khi có PrescriptionId) trong các query liên quan ReturnExchangeItem → OrderItem.           |

### Phase 5: Bảo mật & hoàn thiện

| #   | Hạng mục           | Chi tiết                                                                                                                                                          |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | **Authentication** | Thay `Guid.NewGuid()` bằng `User.FindFirst(ClaimTypes.NameIdentifier)` (và role) cho CustomerId, SalesUserId, OperationUserId trong ReturnExchangeController.     |
| 5.2 | **Authorization**  | Customer: chỉ tạo/xem yêu cầu của mình; Sales: pending + review; Operation: approved + receive.                                                                   |
| 5.3 | **Response DTO**   | Trả về InspectionResult trong ReturnExchangeItemResponse (và PrescriptionId/ServiceId trong chi tiết item nếu frontend cần phân biệt kính thường vs kính custom). |

---

## 7. Luồng trạng thái sau khi bổ sung

```
ReturnExchange.Status:
  Pending
    → ApprovedBySales (Sales phê duyệt)
    → Rejected (Sales từ chối, ResolvedAt set)
  ApprovedBySales
    → ReceivedByOperation (Operations nhận hàng + nhập kết quả kiểm tra)
  ReceivedByOperation
    → Completed (khi tất cả item đã xử lý, ResolvedAt set)

ReturnExchangeItem.Status:
  Pending → Approved | Rejected (Sales review)
  Approved → Received (Operations receive + InspectionResult)

ReturnExchangeItem.InspectionResult (mới):
  Available | Defective | Damaged | NeedRepair (lưu khi Operations nhận hàng)

ProductVariant.Status / Product.Status:
  Cập nhật theo InspectionResult khi item có ProductVariantId.

Prescription.Status (mới):
  Cập nhật theo InspectionResult khi item là kính custom (OrderItem.PrescriptionId hoặc CustomerId + ServiceId).
```

---

## 8. Tóm tắt bảng & thay đổi

| Thành phần                   | Vai trò trong đổi trả                                     | Thay đổi đề xuất                                                               |
| ---------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **ReturnExchange**           | Yêu cầu đổi trả (1 đơn, 1 khách)                          | Thêm xử lý chuyển sang `Completed` + `ResolvedAt`.                             |
| **ReturnExchangeItem**       | Từng dòng sản phẩm (thường hoặc custom)                   | Thêm `InspectionResult`.                                                       |
| **ReturnExchangeImage**      | Ảnh minh chứng theo dòng                                  | Không đổi.                                                                     |
| **ReturnExchangeHistory**    | Lịch sử thao tác                                          | Thêm bản ghi khi Completed.                                                    |
| **OrderItem**                | Liên kết đơn với ProductVariant hoặc Service/Prescription | Thêm `PrescriptionId` (nullable) để gắn kính custom với Prescription.          |
| **Prescription**             | Lưu trữ thông tin kính custom                             | Thêm `Status`, `UpdatedAt`; cập nhật khi Operations kiểm tra item kính custom. |
| **Product / ProductVariant** | Sản phẩm thường                                           | Cập nhật Status theo InspectionResult khi Operations nhận hàng.                |

---

## 9. Thứ tự thực hiện gợi ý

1. **Phase 1** — Entity + Migration: ReturnExchangeItem.InspectionResult, Prescription.Status (và UpdatedAt), OrderItem.PrescriptionId.
2. **Phase 2** — DTO: ReceiveItemRequest.InspectionResult; validation.
3. **Phase 3** — ReturnExchangeService.ReceiveReturnExchangeAsync: gán InspectionResult; cập nhật ProductVariant/Product khi có ProductVariantId; cập nhật Prescription khi item là kính custom; set Completed + ResolvedAt + History.
4. **Phase 4** — Đảm bảo query load đủ OrderItem (ProductVariant, Product, Prescription).
5. **Phase 5** — Auth, authorization, response DTO (InspectionResult, v.v.).
6. **Frontend (nếu có)** — Màn Operations: chọn kết quả kiểm tra từng item (dropdown); hiển thị loại item (sản phẩm thường / kính custom) nếu cần.
7. **Kiểm thử** — Luồng đầy đủ: tạo yêu cầu → Sales duyệt → Operations nhận hàng + nhập InspectionResult → kiểm tra DB: ReturnExchange = Completed, ResolvedAt set, ProductVariant.Status và Prescription.Status đã cập nhật đúng.

---

## 10. Review đầy đủ – Đánh giá plan

### 10.1 Những phần đã đầy đủ

| Hạng mục                            | Đánh giá                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Luồng nghiệp vụ**                 | Đủ 4 bước: Customer tạo → Sales review → Operations nhận & kiểm tra → Hoàn tất.                                               |
| **4 bảng đổi trả**                  | Mô tả rõ vai trò, thuộc tính, quan hệ của ReturnExchange, ReturnExchangeItem, ReturnExchangeImage, ReturnExchangeHistory.     |
| **Phân loại sản phẩm**              | Phân biệt sản phẩm thường (Product/ProductVariant) và kính custom (Prescription); nêu cách liên kết OrderItem ↔ Prescription. |
| **Workflow chi tiết**               | Mỗi bước có: hành động, API, điều kiện, bảng INSERT/UPDATE, luồng chuyển dữ liệu giữa các bảng.                               |
| **Hiện trạng & khoảng trống**       | Rõ bước nào đã có, bước nào thiếu (cập nhật Product/Prescription, Completed, InspectionResult).                               |
| **Kế hoạch triển khai**             | 5 phase: Entity + Migration → DTO/API → Service logic → Repository/DbContext → Bảo mật & DTO response.                        |
| **Luồng trạng thái & tóm tắt bảng** | Sơ đồ status, bảng tổng hợp bảng được ghi từng bước, bảng tóm tắt thay đổi theo từng entity.                                  |
| **Thứ tự thực hiện**                | Gợi ý thứ tự Phase 1 → 5, frontend, kiểm thử.                                                                                 |

### 10.2 Điểm cần làm rõ hoặc bổ sung (tùy chọn)

**Quy tắc đã làm rõ (Section 1.1):** Người dùng có đơn hàng thì **được phép đổi trả những sản phẩm trong đơn hàng đó nếu có vấn đề về sản phẩm** — khách chọn một hoặc nhiều dòng (OrderItem) trong đơn, gửi lý do (và ảnh); chỉ áp dụng cho đơn của chính khách đó.

| #   | Nội dung                               | Gợi ý                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Phê duyệt theo từng dòng (item)**    | Hiện code Sales chỉ duyệt/từ chối **cả yêu cầu** (ReturnExchange), không cập nhật ReturnExchangeItem.Status từng dòng. Nếu nghiệp vụ cần “duyệt từng sản phẩm”, cần bổ sung logic (và DTO) trong ReviewReturnExchange để cập nhật Status từng ReturnExchangeItem (Approved/Rejected). |
| 2   | **Các loại OrderItem khác**            | OrderItem còn LensesVariantId, ComboItemId, SlotId. Plan chỉ nêu ProductVariant và Prescription (ServiceId). Nếu đổi trả áp dụng cho lens/combo/slot (khi có vấn đề về sản phẩm), cần quy định có cập nhật trạng thái bảng tương ứng hay không và bổ sung vào Phase 3.                |
| 3   | **Validation số lượng**                | ReturnExchangeItem.Quantity: nên validate ≤ OrderItem.Quantity (và tổng quantity đã đổi trả trước đó nếu cho phép nhiều lần đổi trả trên cùng OrderItem). Có thể ghi trong Phase 2 (Validation) hoặc Phase 3.                                                                         |
| 4   | **Nhiều yêu cầu đổi trả trên một đơn** | Một Order có thể có nhiều bản ghi ReturnExchange (khách gửi nhiều yêu cầu cho các sản phẩm có vấn đề khác nhau). Cần quy định: có giới hạn số yêu cầu hay chỉ cho phép khi yêu cầu trước đã Completed/Rejected; bổ sung vào quy tắc Section 1.1 hoặc Phase 2/3.                       |
| 5   | **Hoàn tiền (refund)**                 | Đổi trả thường đi kèm hoàn tiền. Plan chưa đề cập bảng Payment hay quy trình tài chính. Có thể thêm ghi chú: “Hoàn tiền (refund) nằm ngoài phạm vi plan này; khi cần sẽ tích hợp với Payment / quy trình tài chính riêng.”                                                            |
| 6   | **Thông báo khách hàng**               | Khi trạng thái đổi trả thay đổi (Approved, Rejected, Received, Completed), có gửi email/notification cho Customer hay không. Có thể ghi là hạng mục mở rộng (Phase sau hoặc optional).                                                                                                |

### 10.3 Kết luận

- **Plan đã đủ** cho mục tiêu: mô tả workflow đổi trả, 4 bảng lưu trữ, lưu trữ & chuyển dữ liệu từng bước, cập nhật trạng thái sản phẩm thường (Product/ProductVariant) và kính custom (Prescription), cùng kế hoạch triển khai từ entity → API → service → bảo mật.
- **Có thể triển khai** theo đúng các Phase 1–5 và thứ tự Section 9.
- Các mục Section 10.2 là **làm rõ/bổ sung tùy chọn** theo nghiệp vụ (phê duyệt từng item, loại OrderItem khác, validation, nhiều yêu cầu/đơn, hoàn tiền, thông báo); bổ sung khi cần mà không làm thay đổi cấu trúc plan hiện tại.

---

Kế hoạch này đảm bảo đổi trả được lưu trữ đầy đủ bằng **4 bảng ReturnExchange, ReturnExchangeHistory, ReturnExchangeImage, ReturnExchangeItem**, đồng thời **cập nhật trạng thái** cho cả **sản phẩm thường** (Product/ProductVariant) và **sản phẩm kính custom** (Prescription) sau khi Operations kiểm tra.
