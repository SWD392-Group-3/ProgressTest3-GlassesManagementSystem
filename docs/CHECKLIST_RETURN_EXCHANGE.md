# Checklist triển khai tính năng Đổi trả đơn hàng

Checklist step-by-step dựa trên [PLAN_RETURN_EXCHANGE_WORKFLOW.md](./PLAN_RETURN_EXCHANGE_WORKFLOW.md), **bám đúng kiến trúc source code** trong `backend/`.

---

## Bắt đầu công việc

### Điều kiện trước khi bắt đầu

- [ ] Đã cài .NET SDK (project dùng net9.0) và EF Core tools (`dotnet tool install --global dotnet-ef` nếu chưa có)
- [ ] Solution build được: `cd backend` rồi `dotnet build` (hoặc build từ root nếu có file .sln)
- [ ] Có connection string tới database (PostgreSQL) trong `GlassesManagementSystem/appsettings.json` để chạy migration

### Thứ tự thực hiện (bắt buộc)

1. **Chuẩn bị** → đọc plan, tạo branch.
2. **Phase 1** (Entity + Configuration + Migration) → xong hết mới sang Phase 2.
3. **Phase 2** (DTO + Validation) → có thể làm song song 2.1, 2.2, 2.3; thêm Response DTO (2.4) để Phase 3 map được.
4. **Phase 3** (Service logic) → làm 3.1 trước (repository method), rồi 3.2 → 3.5.
5. **Phase 4** (verify Repository/DbContext) → kiểm tra nhanh, không chặn Phase 3.
6. **Phase 5** (Auth + Response DTO cuối) → có thể làm sau khi Phase 3 đã test cơ bản.
7. **Kiểm thử** → chạy API và kiểm tra DB.

### Bước đầu tiên nên làm (ngay bây giờ)

1. Tạo branch: `git checkout -b feature/return-exchange-inspection-result`
2. Mở file **`backend/DataAccessLayer/Database/Entities/ReturnExchangeItem.cs`**
3. Thêm property: `public string? InspectionResult { get; set; }`
4. Tiếp theo làm lần lượt **Phase 1.2** (Configuration), rồi **1.3, 1.4, 1.5** (Prescription, OrderItem, Migration)

---

## Kiến trúc code (backend) – Tham chiếu khi triển khai

| Tầng | Thư mục / file | Ghi chú |
|------|-----------------|--------|
| **DataAccessLayer (DAL)** | `backend/DataAccessLayer/` | |
| → Entities | `Database/Entities/*.cs` | ReturnExchange, ReturnExchangeItem, OrderItem, Prescription, Product, ProductVariant |
| → Configurations | `Database/Configurations/*Configuration.cs` | EF Fluent API, tên bảng |
| → DbContext | `Database/ApplicationDbContext.cs`, `IApplicationDbContext.cs` | DbSet, ApplyConfiguration |
| → Repositories | `Repositories/Interfaces/I*.cs`, `Repositories/Implementations/*.cs` | IGenericRepository&lt;T&gt;, IReturnExchangeRepository, IReturnExchangeItemRepository, … |
| → UnitOfWork | `Repositories/UnitOfWork.cs`, `Interfaces/IUnitOfWork.cs` | `GetRepository<T>()` cho entity chưa có repo riêng (Order, Prescription, ProductVariant, Product) |
| **BusinessLogicLayer (BLL)** | `backend/BusinessLogicLayer/` | |
| → DTOs | `DTOs/*.cs` | ReturnExchange: `CreateReturnExchangeRequest.cs`, `ReceiveReturnExchangeRequest.cs` (chứa `ReceiveItemRequest`), `ReviewReturnExchangeRequest.cs`, `ReturnExchangeResponse.cs` (chứa `ReturnExchangeItemResponse`, …) |
| → Services | `Services/Interfaces/I*.cs`, `Services/Implementations/*.cs` | IReturnExchangeService, ReturnExchangeService |
| **GlassesManagementSystem (API)** | `backend/GlassesManagementSystem/` | |
| → Controllers | `Controllers/ReturnExchangeController.cs` | Route `api/[controller]` |
| → DI | `Program.cs` (IReturnExchangeService), `Extensions/ServiceCollectionExtensions.cs` (AddDataAccess: DbContext, UnitOfWork, ReturnExchange* repos) | PrescriptionRepository có trong DAL nhưng **chưa đăng ký DI** → dùng `_unitOfWork.GetRepository<Prescription>()` |
| **Migrations** | `DataAccessLayer/Migrations/` | Tạo từ API project: `--project DataAccessLayer --startup-project GlassesManagementSystem` |

**Quy ước hiện tại:** Service nhận `IUnitOfWork` + các repo cụ thể (IReturnExchangeRepository, IReturnExchangeItemRepository, …). Entity không có repo riêng đăng ký trong DI thì dùng `_unitOfWork.GetRepository<T>()` (ví dụ Prescription, ProductVariant, Product).

**Đường dẫn trong checklist:** Tất cả path dạng `backend/...` hoặc `DataAccessLayer/...` là **tương đối so với root repository** (thư mục chứa file này, ví dụ `ProgressTest3-GlassesManagementSystem`).

---

## Review đề xuất thay đổi Entity – Cần thiết & ảnh hưởng logic khác

*(Đã rà soát codebase: OrderService, ReturnExchangeService, CartItem, Prescription, OrderItem, DTOs.)*

| Entity / thay đổi | Cần thiết? | Ảnh hưởng logic tính năng khác |
|-------------------|------------|----------------------------------|
| **ReturnExchangeItem.InspectionResult** | **Có** — cần lưu kết quả kiểm tra từng dòng đổi trả và dùng để cập nhật ProductVariant/Prescription. | **Không.** Chỉ ReturnExchangeService đọc/ghi; không có chỗ nào khác dùng ReturnExchangeItem. |
| **Prescription.Status, Prescription.UpdatedAt** | **Có** — cần cập nhật trạng thái kính custom sau khi Operations kiểm tra. | **Rất thấp.** Hiện không có code nào tạo hoặc cập nhật Prescription (chỉ có entity + repository). Chỉ ReturnExchangeService.ReceiveReturnExchangeAsync sẽ set Status/UpdatedAt. *Lưu ý:* Nếu sau này có API tạo Prescription, nên set mặc định (vd. Status = "Active", UpdatedAt = CreatedAt). Migration có thể set `UpdatedAt = CreatedAt` cho bản ghi cũ. |
| **OrderItem.PrescriptionId** (nullable + navigation Prescription) | **Tùy chọn.** Tính năng đổi trả **vẫn chạy được không cần** cột này: có thể tra Prescription theo `Order.CustomerId` + `OrderItem.ServiceId` (plan đã nêu). | **Có, nếu thêm.** Hiện **OrderService** (CreateFromCartAsync, CreateManualOrderAsync) tạo OrderItem **không** set PrescriptionId; **CartItem** và **ManualOrderItemRequest** cũng không có PrescriptionId. Nếu thêm OrderItem.PrescriptionId thì: (1) Cột nullable → không phá code hiện tại; (2) Muốn “gắn đơn hàng với đơn kính custom cụ thể” thì phải mở rộng **CreateManualOrderRequest** / **ManualOrderItemRequest** (và có thể CartItem, CreateOrderRequest) để nhận PrescriptionId và set khi tạo OrderItem. Có thể làm **giai đoạn 2** hoặc bỏ qua nếu chỉ dùng CustomerId + ServiceId. |

**Gợi ý triển khai:**

- **Bắt buộc cho tính năng đổi trả:** Phase 1.2 (ReturnExchangeItem.InspectionResult), Phase 1.3 (Prescription.Status, UpdatedAt). Migration: với Prescription.UpdatedAt có thể set default cho cột (vd. `default: DateTime.UtcNow` hoặc trong migration gán `UpdatedAt = CreatedAt` cho hàng cũ).
- **OrderItem.PrescriptionId (Phase 1.4):** Có thể đánh dấu **tùy chọn** — triển khai nếu muốn liên kết rõ đơn hàng ↔ đơn kính; nếu không thì bỏ qua 1.4 và trong Phase 3.4 chỉ dùng tra Prescription theo CustomerId + ServiceId. Nếu làm 1.4 thì sau này cần bổ sung logic (và DTO) khi tạo đơn hàng có kính custom để gán PrescriptionId.

---

## Chuẩn bị

- [ ] Đọc toàn bộ plan: [PLAN_RETURN_EXCHANGE_WORKFLOW.md](./PLAN_RETURN_EXCHANGE_WORKFLOW.md) (phần 1–4 đủ để bắt đầu code)
- [ ] Xác nhận quy tắc nghiệp vụ: khách hàng có đơn hàng được phép đổi trả sản phẩm trong đơn **nếu có vấn đề về sản phẩm**
- [ ] Tạo branch mới trước khi sửa Entity (ví dụ `feature/return-exchange-inspection-result`) và commit backup nếu cần
- [ ] **Lệnh `dotnet ef`:** chạy từ **thư mục chứa file .sln** (repo root hoặc `backend/`). Nếu không có .sln, chạy từ `backend/` và chỉ định đúng `--project` và `--startup-project`

---

## Phase 1: Chuẩn hóa dữ liệu & mở rộng Entity

*(Tất cả Entity và Configuration nằm trong `backend/DataAccessLayer/`.)*

### 1.1 Trạng thái sau kiểm tra (enum/const)

- [x] Tạo class/static constants cho giá trị InspectionResult: `Available`, `Defective`, `Damaged`, `NeedRepair`
- [x] Đặt trong **BLL** (ví dụ `BusinessLogicLayer/Constants/ReturnExchangeConstants.cs` hoặc `Enums/InspectionResult.cs`) để dùng trong Service và Validation; tránh tham chiếu BLL → DAL nếu đặt ở DAL

### 1.2 ReturnExchangeItem

- [x] File **`DataAccessLayer/Database/Entities/ReturnExchangeItem.cs`**: thêm property `InspectionResult` (string?, nullable)
- [x] File **`DataAccessLayer/Database/Configurations/ReturnExchangeItemConfiguration.cs`**: cấu hình `.Property(x => x.InspectionResult).HasMaxLength(50)` (và IsRequired(false) nếu cần)

### 1.3 Prescription

- [x] File **`DataAccessLayer/Database/Entities/Prescription.cs`**: thêm `Status` (string?, nullable) và `UpdatedAt` (DateTime hoặc DateTime? — nếu DateTime? thì bản ghi cũ không cần default; nếu DateTime thì trong migration set default cho cột, vd. `UpdatedAt = CreatedAt` cho hàng đã tồn tại)
- [x] File **`DataAccessLayer/Database/Configurations/PrescriptionConfiguration.cs`**: cấu hình hai cột mới (Status HasMaxLength; UpdatedAt timestamptz). *Gợi ý migration:* với bản ghi Prescription đã tồn tại, set `UpdatedAt = CreatedAt` (hoặc cột nullable rồi chỉ set khi ReturnExchangeService cập nhật)
- [x] *Ảnh hưởng:* Hiện không có logic nào tạo/cập nhật Prescription ngoài ReturnExchangeService; chỉ service đổi trả sẽ ghi Status/UpdatedAt

### 1.4 OrderItem – **Tùy chọn** (xem mục Review Entity phía trên)

- [ ] File **`DataAccessLayer/Database/Entities/OrderItem.cs`**: thêm `PrescriptionId` (Guid?, nullable) và navigation `public virtual Prescription? Prescription { get; set; }`
- [ ] File **`DataAccessLayer/Database/Configurations/OrderItemConfiguration.cs`**: `HasOne(x => x.Prescription).WithMany().HasForeignKey(x => x.PrescriptionId).OnDelete(DeleteBehavior.SetNull)` (hoặc Restrict tùy nghiệp vụ)
- [x] *(Nếu bỏ qua 1.4)* Trong Phase 3.4 tra Prescription theo `Order.CustomerId` + `OrderItem.ServiceId` thay vì PrescriptionId. *(Nếu làm 1.4)* Sau này khi cần “đơn hàng gắn đơn kính cụ thể” thì bổ sung: ManualOrderItemRequest.PrescriptionId, OrderService.CreateManualOrderAsync (và có thể CreateFromCartAsync) set OrderItem.PrescriptionId; OrderItemDto.PrescriptionId nếu API cần trả về.
- [ ] (Tùy chọn) Trong **`Prescription.cs`**: thêm `ICollection<OrderItem> OrderItems` nếu cần navigation ngược — hiện Prescription không có collection OrderItems, có thể bỏ qua

### 1.5 Migration

- [x] Từ thư mục có .sln (repo root hoặc backend):  
  `dotnet ef migrations add AddReturnExchangeInspectionAndPrescriptionStatus --project DataAccessLayer --startup-project GlassesManagementSystem`
- [x] Kiểm tra file tạo ra trong **`backend/DataAccessLayer/Migrations/`**: migration thêm cột `InspectionResult` (RETURN_EXCHANGE_ITEMS), `Status`, `UpdatedAt` (PRESCRIPTIONS), và nếu làm Phase 1.4 thì `PrescriptionId` (ORDER_ITEMS). *Nếu bỏ qua 1.4:* tạo migration chỉ với thay đổi 1.2 + 1.3 (không có PrescriptionId)
- [ ] Áp dụng migration:  
  `dotnet ef database update --project DataAccessLayer --startup-project GlassesManagementSystem`  
  (nếu solution nằm ở repo root thì đảm bảo chạy từ đó; nếu chỉ có backend thì dùng `--project backend/DataAccessLayer --startup-project backend/GlassesManagementSystem` tùy cấu trúc thư mục)
- [ ] Verify DB: bảng/cột mới tồn tại đúng (vd: dùng pgAdmin hoặc `psql`)
- [x] Build lại solution: `dotnet build` (từ backend hoặc repo root) — đảm bảo không lỗi compile trước khi sang Phase 2

---

## Phase 2: DTO & API Request

*(DTO nằm trong `backend/BusinessLogicLayer/DTOs/`.)*

### 2.1 ReceiveItemRequest

- [x] File **`BusinessLogicLayer/DTOs/ReceiveReturnExchangeRequest.cs`**: trong class `ReceiveItemRequest`, thêm property `InspectionResult` (string?, optional)

### 2.2 ReturnExchangeController

- [x] File **`GlassesManagementSystem/Controllers/ReturnExchangeController.cs`**: xác nhận action `POST receive` nhận body có `Items[].InspectionResult` (binding tự động từ body)
- [ ] (Tùy chọn) Cập nhật XML summary / Swagger cho request có InspectionResult

### 2.3 Validation

- [x] Trong **ReturnExchangeService** (hoặc validator riêng nếu có): validate `InspectionResult` nếu có giá trị thì phải nằm trong danh sách cho phép (Available, Defective, Damaged, NeedRepair)
- [ ] Quy định: item có ProductVariantId thì khi Operations receive nên có (hoặc cho phép) InspectionResult; item có ServiceId/PrescriptionId (kính custom) tương tự
- [ ] (Khuyến nghị) Trong **CreateReturnExchangeAsync**: validate `item.Quantity <= OrderItem.Quantity` (lấy OrderItem qua _unitOfWork.GetRepository<OrderItem>() hoặc từ order)

### 2.4 Response DTO (để Phase 3 có thể map ngay)

- [x] File **`BusinessLogicLayer/DTOs/ReturnExchangeResponse.cs`**: trong class **ReturnExchangeItemResponse**, thêm property `public string? InspectionResult { get; set; }`

---

## Phase 3: Logic Service – ReceiveReturnExchangeAsync

*(Service: **`BusinessLogicLayer/Services/Implementations/ReturnExchangeService.cs`**. Dùng `IUnitOfWork` + các repo đã inject; Prescription/ProductVariant/Product dùng `_unitOfWork.GetRepository<T>()`.)*

### 3.1 Load ReturnExchangeItem kèm OrderItem (ProductVariant, Prescription)

- [x] **Repository:** Trong **`DataAccessLayer/Repositories/Interfaces/IReturnExchangeItemRepository.cs`** thêm method `Task<ReturnExchangeItem?> GetByIdWithOrderItemDetailsAsync(Guid id, CancellationToken cancellationToken = default)`
- [x] **Implementation:** Trong **`DataAccessLayer/Repositories/Implementations/ReturnExchangeItemRepository.cs`** implement: query ReturnExchangeItem by id với `.Include(x => x.OrderItem).ThenInclude(o => o!.ProductVariant).ThenInclude(pv => pv!.Product)`. Nếu đã làm Phase 1.4 (OrderItem.PrescriptionId): thêm `.Include(x => x.OrderItem).ThenInclude(o => o!.Prescription)`; nếu bỏ qua 1.4 thì chỉ cần OrderItem (tra Prescription theo CustomerId + ServiceId trong service)
- [x] Trong **ReceiveReturnExchangeAsync**: với mỗi item trong request, gọi `GetByIdWithOrderItemDetailsAsync(item.ReturnExchangeItemId)` thay vì `GetByIdAsync` khi cần cập nhật ProductVariant/Prescription

### 3.2 Cập nhật ReturnExchangeItem

- [x] Trong **ReceiveReturnExchangeAsync**: với mỗi `ReceiveItemRequest`, gán `returnItem.InspectionResult = item.InspectionResult`
- [x] Giữ logic hiện tại: cập nhật `returnItem.Status`, `returnItem.Note`, thêm ReturnExchangeImage nếu request có ảnh; gọi `_returnExchangeItemRepository.Update(returnItem)`

### 3.3 Item là sản phẩm thường (ProductVariant / Product)

- [x] Sau khi có `returnItem` (với OrderItem đã include): nếu `returnItem.OrderItem?.ProductVariantId != null`, lấy `OrderItem.ProductVariant` (và `OrderItem.ProductVariant.Product` nếu cần)
- [x] Gán `ProductVariant.Status = InspectionResult` (dùng constant đã định nghĩa); nếu Product cần đồng bộ Status thì gán `Product.Status` tương tự
- [x] Gọi `_unitOfWork.GetRepository<ProductVariant>().Update(productVariant)`; nếu cập nhật Product thì `_unitOfWork.GetRepository<Product>().Update(product)`

### 3.4 Item là kính custom (Prescription)

- [ ] Nếu `returnItem.OrderItem?.PrescriptionId != null`: lấy Prescription qua `returnItem.OrderItem.Prescription` (đã include) hoặc `_unitOfWork.GetRepository<Prescription>().GetByIdAsync(returnItem.OrderItem.PrescriptionId)`
- [x] Gán `Prescription.Status = InspectionResult`, `Prescription.UpdatedAt = DateTime.UtcNow`; gọi `_unitOfWork.GetRepository<Prescription>().Update(prescription)`
- [x] Nếu chưa có PrescriptionId (hoặc đã bỏ qua Phase 1.4): tra Prescription theo `Order.CustomerId` + `OrderItem.ServiceId` (ví dụ `_unitOfWork.GetRepository<Prescription>().FirstOrDefaultAsync(p => p.CustomerId == order.CustomerId && p.ServiceId == orderItem.ServiceId)` hoặc sort theo CreatedAt lấy mới nhất), rồi cập nhật Status và UpdatedAt

### 3.5 Hoàn tất đơn đổi trả (Completed)

- [x] Sau khi xử lý xong tất cả item trong request: kiểm tra mọi ReturnExchangeItem của ReturnExchange này đã ở trạng thái Received (hoặc tương đương)
- [x] Nếu đủ điều kiện: set `returnExchange.Status = "Completed"`, `returnExchange.ResolvedAt = DateTime.UtcNow`; `_returnExchangeRepository.Update(returnExchange)`
- [x] Tạo bản ghi **ReturnExchangeHistory**: Action = "Completed", OldStatus = "ReceivedByOperation", NewStatus = "Completed", PerformedByRole = "Operation", PerformedByUserId, PerformedAt = UtcNow; `_returnExchangeHistoryRepository.AddAsync(history)`
- [x] Gọi `_unitOfWork.SaveChangesAsync()` (một lần cuối method)

---

## Phase 4: Repository & DbContext (kiểm tra / bổ sung)

*Phần lớn đã thực hiện ở Phase 3.1; các bước dưới để đảm bảo không thiếu và đúng kiến trúc.*

### 4.1 Prescription

- [x] **Prescription** đã có **`IPrescriptionRepository`** và **`PrescriptionRepository`** trong DAL nhưng **chưa đăng ký** trong **`GlassesManagementSystem/Extensions/ServiceCollectionExtensions.cs`**. Giữ đúng kiến trúc hiện tại: trong **ReturnExchangeService** dùng **`_unitOfWork.GetRepository<Prescription>()`** để GetByIdAsync, Update (không cần inject IPrescriptionRepository trừ khi team quyết định đăng ký thêm)
- [x] Tra cứu Prescription theo CustomerId + ServiceId: dùng `_unitOfWork.GetRepository<Prescription>().FirstOrDefaultAsync(...)` hoặc FindAsync với predicate phù hợp

### 4.2 ReturnExchangeItem – Include khi load

- [x] Đã bổ sung **GetByIdWithOrderItemDetailsAsync** trong Phase 3.1 với Include OrderItem → ProductVariant → Product và OrderItem → Prescription
- [x] **GetReturnExchangeByIdAsync** (và response mapping): nếu cần hiển thị InspectionResult hoặc thông tin Product/Prescription trong response, có thể dùng **GetByReturnExchangeIdAsync** hiện có (đã Include OrderItem, Images); nếu cần thêm ProductVariant/Prescription trong response thì mở rộng **ReturnExchangeItemRepository.GetByReturnExchangeIdAsync** thêm `.ThenInclude(o => o.ProductVariant).ThenInclude(pv => pv.Product)` và `.ThenInclude(o => o.Prescription)` (sau khi OrderItem có PrescriptionId)

---

## Phase 5: Bảo mật & hoàn thiện

### 5.1 Authentication

- [x] File **`GlassesManagementSystem/Controllers/ReturnExchangeController.cs`**: thay `Guid.NewGuid()` cho **customerId** (action Create, GetCustomerReturnExchanges) bằng `User.FindFirst(ClaimTypes.NameIdentifier)?.Value` và parse sang Guid (hoặc claim tương ứng mà Auth đã set)
- [x] Thay **salesUserId** (action Review) và **operationUserId** (action Receive, AddImages, UploadImages) bằng userId từ claims
- [ ] (Tùy chọn) Lấy role từ claims để ghi ReturnExchangeHistory hoặc kiểm tra quyền

### 5.2 Authorization

- [x] Customer: chỉ tạo/xem yêu cầu của mình (customerId từ token = ReturnExchange.CustomerId); GET customer không nhận customerId từ client, lấy từ JWT
- [x] Sales: chỉ gọi GET pending, POST review; Operation: chỉ gọi GET approved, POST receive (dùng `[Authorize(Roles = "Sales")]` / `[Authorize(Roles = "Operation")]` hoặc policy tương ứng nếu đã cấu hình trong Program)
- [x] Áp dụng `[Authorize]` (và role/policy) lên từng action tương ứng

### 5.3 Response DTO & mapping

- [x] Trong **ReturnExchangeService.GetReturnExchangeByIdAsync** (và mọi chỗ build **ReturnExchangeItemResponse**): gán `InspectionResult = i.InspectionResult` (property đã thêm ở Phase 2.4)
- [ ] (Tùy chọn) Thêm PrescriptionId hoặc ServiceId vào ReturnExchangeItemResponse để frontend phân biệt kính thường vs kính custom

---

## Kiểm thử & Verify

### Backend

- [ ] POST CreateReturnExchange: kiểm tra INSERT vào RETURN_EXCHANGES, RETURN_EXCHANGE_ITEMS, RETURN_EXCHANGE_IMAGES, RETURN_EXCHANGE_HISTORY
- [ ] POST review (Sales duyệt): ReturnExchange.Status = ApprovedBySales, ReviewedBySalesAt set
- [ ] POST receive với Items có InspectionResult: ReturnExchangeItem.InspectionResult lưu đúng; ProductVariant.Status / Prescription.Status cập nhật đúng
- [ ] Sau khi tất cả item Received: ReturnExchange.Status = Completed, ResolvedAt set; có bản ghi RETURN_EXCHANGE_HISTORY Action = "Completed"
- [ ] Rejected: Sales từ chối → Status = Rejected, ResolvedAt set
- [ ] Validation: InspectionResult không hợp lệ → trả lỗi; Quantity > OrderItem.Quantity (nếu đã implement) → trả lỗi

### Frontend (nếu có)

- [ ] Màn Operations: danh sách đơn ApprovedBySales; form Nhận hàng có nhập InspectionResult từng item (dropdown: Available, Defective, Damaged, NeedRepair)
- [ ] Hiển thị trạng thái đơn: Pending, ApprovedBySales, ReceivedByOperation, Completed, Rejected
- [ ] (Tùy chọn) Phân biệt item sản phẩm thường vs kính custom trên giao diện

### Tài liệu / Ghi chú

- [ ] Cập nhật API docs (Swagger/OpenAPI) nếu có
- [ ] Ghi chú trong code hoặc wiki: quy tắc InspectionResult, điều kiện set Completed

---

## Tùy chọn (theo nghiệp vụ)

- [ ] **Phê duyệt từng dòng:** Mở rộng ReviewReturnExchangeRequest và ReviewReturnExchangeAsync để cập nhật ReturnExchangeItem.Status từng item (Approved/Rejected)
- [ ] **LensesVariant, ComboItem, Slot:** Nếu đổi trả áp dụng → cập nhật trạng thái bảng tương ứng trong ReceiveReturnExchangeAsync (dùng _unitOfWork.GetRepository<T>() tương ứng)
- [ ] **Nhiều yêu cầu trên một đơn:** Quy định và validate (vd: chỉ cho phép yêu cầu mới khi yêu cầu trước đã Completed/Rejected)
- [ ] **Hoàn tiền (refund):** Tích hợp Payment / quy trình tài chính khi cần
- [ ] **Thông báo khách hàng:** Gửi email/notification khi trạng thái đổi trả thay đổi
- [ ] **Đăng ký IPrescriptionRepository trong DI:** Nếu muốn inject trực tiếp, thêm `services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();` trong **ServiceCollectionExtensions.AddDataAccess** và có thể inject vào ReturnExchangeService thay vì dùng UnitOfWork.GetRepository<Prescription>()

---

## Hoàn tất

- [ ] Toàn bộ mục bắt buộc (Phase 1–5 + Kiểm thử backend) đã hoàn thành
- [ ] Plan và checklist được cập nhật nếu có thay đổi so với bản gốc

---

## Tóm tắt – Có thể bắt đầu khi nào?

| Việc | Có thể bắt đầu? |
|------|------------------|
| Đọc plan + tạo branch | **Có** — không phụ thuộc gì. |
| Phase 1 (Entity + Migration) | **Có** — làm ngay sau Chuẩn bị. Bước đầu tiên: sửa `ReturnExchangeItem.cs` thêm `InspectionResult`. |
| Phase 2 (DTO + Validation) | **Có** — sau khi Phase 1 xong (build OK). |
| Phase 3 (Service) | **Có** — sau Phase 2 (đã có DTO và constants). Làm 3.1 (repository method) trước rồi 3.2–3.5. |
| Phase 4 | Chỉ kiểm tra / bổ sung; không chặn. |
| Phase 5 (Auth, mapping) | Sau khi Phase 3 chạy được; có thể làm dần. |
| Kiểm thử | Sau Phase 3 (tối thiểu) hoặc sau Phase 5. |

**Kết luận:** Có thể bắt đầu công việc ngay sau khi hoàn thành mục **Chuẩn bị** và làm **Bước đầu tiên nên làm** (branch + sửa Entity ReturnExchangeItem).

---

## Checklist cuối cùng (chỉ bước bắt buộc – rút gọn)

*Chỉ liệt kê bước cần làm để tính năng đổi trả (Operations kiểm tra + cập nhật trạng thái sản phẩm + Completed) chạy đủ. Bỏ qua toàn bộ mục đã đánh dấu "Tùy chọn" hoặc "có thể làm sau".*

### Chuẩn bị
- [ ] Đọc plan (phần 1–4), tạo branch (vd. `feature/return-exchange-inspection-result`)

### Phase 1 – Entity & Migration (bắt buộc: 1.1, 1.2, 1.3; bỏ qua 1.4)
- [x] 1.1 Constants InspectionResult (Available, Defective, Damaged, NeedRepair) trong BLL
- [x] 1.2 ReturnExchangeItem: thêm `InspectionResult` (string?) + Configuration HasMaxLength(50)
- [x] 1.3 Prescription: thêm `Status` (string?), `UpdatedAt` (DateTime hoặc DateTime?) + Configuration
- [x] *(Bỏ qua 1.4 OrderItem.PrescriptionId — tra Prescription theo CustomerId + ServiceId)*
- [x] 1.5 Migration (chỉ 1.2 + 1.3) → `dotnet ef migrations add ...` đã chạy; còn `dotnet ef database update` (khi sẵn sàng) + build đã OK

### Phase 2 – DTO & Validation
- [x] 2.1 ReceiveItemRequest: thêm `InspectionResult` (string?)
- [x] 2.2 Controller receive: xác nhận binding Items[].InspectionResult
- [x] 2.3 Validate InspectionResult thuộc danh sách cho phép trong ReceiveReturnExchangeAsync
- [x] 2.4 ReturnExchangeItemResponse: thêm `InspectionResult` (string?)

### Phase 3 – Service
- [x] 3.1 IReturnExchangeItemRepository + ReturnExchangeItemRepository: thêm `GetByIdWithOrderItemDetailsAsync` (Include OrderItem → ProductVariant → Product; không Include Prescription vì bỏ qua 1.4)
- [x] 3.2 ReceiveReturnExchangeAsync: gán returnItem.InspectionResult; Update returnItem; ảnh như hiện tại
- [x] 3.3 Nếu OrderItem.ProductVariantId có: cập nhật ProductVariant.Status = InspectionResult; Update qua UnitOfWork
- [x] 3.4 Nếu OrderItem.ServiceId có (kính custom): tra Prescription theo Order.CustomerId + OrderItem.ServiceId; set Prescription.Status, UpdatedAt; Update qua UnitOfWork
- [x] 3.5 Sau khi xử lý hết item: nếu mọi item Received → set ReturnExchange.Status = "Completed", ResolvedAt; thêm ReturnExchangeHistory "Completed"; SaveChangesAsync

### Phase 4 – Verify
- [x] Prescription dùng _unitOfWork.GetRepository<Prescription>(); không cần đăng ký IPrescriptionRepository trong DI

### Phase 5 – Auth & Response
- [x] 5.1 Controller: thay Guid.NewGuid() bằng userId từ User.FindFirst(ClaimTypes.NameIdentifier)
- [x] 5.2 [Authorize] và role (Sales/Operation) lên các action tương ứng (nếu đã có role trong hệ thống)
- [x] 5.3 GetReturnExchangeByIdAsync: map InspectionResult vào ReturnExchangeItemResponse

### Kiểm thử
- [ ] Create → Review (approve) → Receive (với InspectionResult) → kiểm tra DB: ReturnExchangeItem.InspectionResult, ProductVariant.Status hoặc Prescription.Status, ReturnExchange.Status = Completed, ResolvedAt

---

## Kiểm tra tính năng đổi trả sản phẩm custom (Prescription)

*(Đã rà soát code: ReturnExchangeService, OrderItem, Prescription, ReturnExchangeItemRepository, DTOs.)*

### Kết luận: **Đã hoàn thiện** (logic backend cho kính custom)

| Hạng mục | Trạng thái | Ghi chú |
|----------|------------|--------|
| **Entity & Migration** | ✅ | Prescription có `Status`, `UpdatedAt`; ReturnExchangeItem có `InspectionResult`. Migration đã tạo (chưa chạy `database update` tùy môi trường). |
| **Tạo yêu cầu đổi trả (Create)** | ✅ | Khách gửi `OrderItemId` — không phân biệt sản phẩm thường hay custom. OrderItem có `ServiceId` (kính custom) được hỗ trợ. |
| **Receive – tra Prescription** | ✅ | Load `Order` lấy `CustomerId`; với item có `OrderItem.ServiceId != null` tra Prescription bằng `CustomerId + ServiceId`, cập nhật `Prescription.Status`, `UpdatedAt`. |
| **Receive – InspectionResult** | ✅ | Validate giá trị thuộc `InspectionResult.All`; gán `ReturnExchangeItem.InspectionResult`; cập nhật Prescription khi có ServiceId. |
| **Completed** | ✅ | Khi mọi item `Status == "Received"` → `ReturnExchange.Status = "Completed"`, `ResolvedAt`, thêm History "Completed". |
| **Response** | ✅ | `GetReturnExchangeByIdAsync` map `InspectionResult` vào `ReturnExchangeItemResponse`. |
| **Auth / Authorization** | ✅ | Controller dùng userId từ JWT; `[Authorize]` toàn controller; `[Authorize(Roles = "Sales")]` cho pending, review; `[Authorize(Roles = "Operation")]` cho approved, receive. GET customer lấy customerId từ token (route `GET customer`). |

### Điểm cải thiện tùy chọn (không chặn tính năng)

- **Nhiều Prescription cùng CustomerId + ServiceId:** Hiện dùng `FirstOrDefaultAsync(p => p.CustomerId == ... && p.ServiceId == ...)`. Nếu khách có nhiều đơn kính cùng dịch vụ, có thể thêm `.OrderByDescending(p => p.CreatedAt)` (hoặc truy vấn tương đương) để lấy bản ghi mới nhất khi cập nhật trạng thái.

### Việc cần làm để “hoàn thiện” đầy đủ

1. **Áp dụng migration** (khi sẵn sàng): `dotnet ef database update --project DataAccessLayer --startup-project GlassesManagementSystem`
2. ~~**Phase 5.1, 5.2:**~~ ✅ Đã xong: userId từ JWT, `[Authorize]`, role Sales/Operation.
3. **Kiểm thử thực tế:** Gọi API (với JWT) Create → Review (approve) → Receive với item có `OrderItem.ServiceId` (kính custom), kiểm tra DB: `ReturnExchangeItem.InspectionResult`, `Prescription.Status`, `Prescription.UpdatedAt`, `ReturnExchange.Status = Completed`.
4. **Frontend:** Cập nhật gọi `GET api/ReturnExchange/customer` (không truyền customerId trong URL; token đủ để xác định khách hàng).

---

## Thiết kế tùy chọn – Triển khai hay không

*(Quyết định rõ từng mục: **Có** = triển khai trong scope này, **Không** = không làm, **Sau** = có thể làm giai đoạn sau.)*

| Hạng mục | Triển khai? | Ghi chú |
|----------|-------------|--------|
| **OrderItem.PrescriptionId** (Phase 1.4) | **Không** | Tra Prescription theo CustomerId + ServiceId đủ dùng. Nếu sau này cần “đơn hàng gắn đơn kính cụ thể” thì mới thêm + cập nhật OrderService, ManualOrderItemRequest, OrderItemDto. |
| **Prescription.OrderItems** (navigation ngược) | **Không** | Không dùng trong flow đổi trả. |
| **Cập nhật XML/Swagger** cho request InspectionResult | **Sau** | Không bắt buộc; làm khi hoàn thiện API docs. |
| **Validate Quantity ≤ OrderItem.Quantity** (CreateReturnExchange) | **Sau** (hoặc **Có** nếu muốn chặt) | Khuyến nghị nhưng không chặn flow; có thể bổ sung khi rảnh. |
| **PrescriptionId / ServiceId trong ReturnExchangeItemResponse** | **Không** | Frontend có thể phân biệt qua OrderItemId + dữ liệu order; thêm khi frontend yêu cầu. |
| **Lấy role từ claims** (Phase 5.1) | **Sau** | Khi đã có role trong JWT và cần ghi PerformedByRole chính xác. |
| **Phê duyệt từng dòng** (Sales duyệt/từ chối từng ReturnExchangeItem) | **Không** | Hiện duyệt cả yêu cầu; đủ dùng. Làm sau nếu nghiệp vụ yêu cầu. |
| **LensesVariant, ComboItem, Slot** – cập nhật trạng thái khi đổi trả | **Không** | Chỉ áp dụng ProductVariant và Prescription. Mở rộng sau nếu nghiệp vụ cần. |
| **Nhiều yêu cầu trên một đơn** – quy định/validate | **Không** | Không giới hạn trong scope này. |
| **Hoàn tiền (refund)** | **Không** | Nằm ngoài scope; tích hợp Payment khi có yêu cầu. |
| **Thông báo khách hàng** (email/notification khi trạng thái đổi) | **Không** | Làm sau nếu có module notification. |
| **Đăng ký IPrescriptionRepository trong DI** | **Không** | Giữ dùng UnitOfWork.GetRepository<Prescription>(). |

**Tóm tắt:** Trong scope hiện tại **triển khai** đủ: InspectionResult (entity + DTO + service + response), Prescription.Status/UpdatedAt, tra Prescription theo CustomerId + ServiceId, Completed + ResolvedAt, Auth (userId từ claims). **Không triển khai:** OrderItem.PrescriptionId, phê duyệt từng dòng, lens/combo/slot, refund, notification, đăng ký PrescriptionRepository; các mục **Sau** làm khi cần.

---

*Tham chiếu: [PLAN_RETURN_EXCHANGE_WORKFLOW.md](./PLAN_RETURN_EXCHANGE_WORKFLOW.md). Kiến trúc: DAL → BLL → API.*
