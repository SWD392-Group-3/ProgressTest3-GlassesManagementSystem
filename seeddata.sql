-- =============================================================================
-- Seed Data cho Glasses Management System (PostgreSQL)
-- Chạy sau khi đã chạy migration (database GlassesDb đã có đủ bảng).
-- Cách chạy: psql -U postgres -d GlassesDb -f seeddata.sql
-- Hoặc mở file trong pgAdmin và Execute.
-- Mật khẩu cho tất cả user seed: password
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS (mật khẩu: password)
-- -----------------------------------------------------------------------------
INSERT INTO "USERS" (
    "Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "Status", "CreatedAt", "UpdatedAt"
)
VALUES
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'admin@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Quản trị viên', NULL, 'Admin', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'staff@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Nhân viên cửa hàng', '0901234567', 'Staff', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000003'::uuid, 'customer@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Khách hàng mẫu', '0912345678', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000004'::uuid, 'customer2@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Trần Thị Lan', '0987654321', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000005'::uuid, 'customer3@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Lê Văn Minh', '0978123456', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    -- Operation account (mật khẩu: password)
    ('a0000000-0000-0000-0000-000000000006'::uuid, 'operation@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Nhân viên Operation', '0900000000', 'Operation', 'Active',
     NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    -- Manager account (mật khẩu: password)
    ('a0000000-0000-0000-0000-000000000007'::uuid, 'manager@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Quản lý cửa hàng', '0901111111', 'Manager', 'Active',
     NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Email") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO "CATEGORIES" ("Id", "Name", "Description", "Status")
VALUES
    ('b1000000-0000-0000-0000-000000000001'::uuid, 'Gọng kính', 'Gọng kính cận, viễn, thời trang', 'Active'),
    ('b1000000-0000-0000-0000-000000000002'::uuid, 'Tròng kính', 'Tròng kính đơn tròng, đa tròng', 'Active'),
    ('b1000000-0000-0000-0000-000000000003'::uuid, 'Kính mát', 'Kính mát thời trang, chống UV', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. BRANDS
-- -----------------------------------------------------------------------------
INSERT INTO "BRANDS" ("Id", "Name", "Description", "Country", "Status")
VALUES
    ('b2000000-0000-0000-0000-000000000001'::uuid, 'Ray-Ban', 'Thương hiệu kính mắt nổi tiếng', 'USA', 'Active'),
    ('b2000000-0000-0000-0000-000000000002'::uuid, 'Essilor', 'Tròng kính cao cấp', 'Pháp', 'Active'),
    ('b2000000-0000-0000-0000-000000000003'::uuid, 'Oakley', 'Kính thể thao, chống va đập', 'USA', 'Active'),
    ('b2000000-0000-0000-0000-000000000004'::uuid, 'Nikon', 'Tròng kính quang học Nhật Bản', 'Nhật Bản', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. WARRANTY_POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO "WARRANTY_POLICIES" ("Id", "Name", "Description", "WarrantyPeriodMonth", "Conditions", "Status")
VALUES
    ('b3000000-0000-0000-0000-000000000001'::uuid, 'Bảo hành 12 tháng', 'Bảo hành lỗi sản xuất', 12, 'Áp dụng cho sản phẩm chính hãng', 'Active'),
    ('b3000000-0000-0000-0000-000000000002'::uuid, 'Bảo hành 24 tháng', 'Bảo hành mở rộng', 24, 'Sản phẩm cao cấp', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. PROMOTIONS
-- -----------------------------------------------------------------------------
INSERT INTO "PROMOTIONS" ("Id", "Code", "Name", "Description", "DiscountValue", "StartDate", "EndDate", "Status")
VALUES
    ('b4000000-0000-0000-0000-000000000001'::uuid, 'GIAM10', 'Giảm 10% đơn hàng', 'Áp dụng cho đơn từ 500k', 10.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '30 days')::timestamptz, 'Active'),
    ('b4000000-0000-0000-0000-000000000002'::uuid, 'GIAM20', 'Giảm 20% đơn từ 1 triệu', 'Áp dụng đơn từ 1.000.000đ', 20.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '60 days')::timestamptz, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. SERVICES
-- -----------------------------------------------------------------------------
INSERT INTO "SERVICES" ("Id", "Name", "Description", "Price", "Status")
VALUES
    ('b5000000-0000-0000-0000-000000000001'::uuid, 'Đo mắt', 'Đo khám mắt tổng quát', 50000.00, 'Active'),
    ('b5000000-0000-0000-0000-000000000002'::uuid, 'Cắt kính', 'Cắt lắp tròng kính', 100000.00, 'Active'),
    ('b5000000-0000-0000-0000-000000000003'::uuid, 'Vệ sinh kính', 'Vệ sinh và bảo dưỡng kính', 30000.00, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. COMBOS
-- -----------------------------------------------------------------------------
INSERT INTO "COMBOS" ("Id", "Name", "Description", "BasePrice", "StartDate", "EndDate", "Status")
VALUES
    ('b6000000-0000-0000-0000-000000000001'::uuid, 'Combo gọng + tròng', 'Gọng kính + tròng cận', 350000.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '90 days')::timestamptz, 'Active'),
    ('b6000000-0000-0000-0000-000000000002'::uuid, 'Combo đo mắt + cắt kính', 'Đo mắt và cắt lắp tròng', 120000.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '45 days')::timestamptz, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. PRODUCTS (CategoryId, BrandId, WarrantyPolicyId)
-- -----------------------------------------------------------------------------
INSERT INTO "PRODUCTS" ("Id", "CategoryId", "BrandId", "WarrantyPolicyId", "Name", "Description", "Status", "ImageUrl", "CreatedAt", "UpdatedAt")
VALUES
    ('b7000000-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid,
     'b2000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Ray-Ban Classic Aviator', 'Gọng aviator cổ điển', 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000002'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid,
     'b2000000-0000-0000-0000-000000000002'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Tròng đơn tròng Essilor', 'Tròng kính đơn tròng chống trầy', 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000003'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid,
     'b2000000-0000-0000-0000-000000000003'::uuid, 'b3000000-0000-0000-0000-000000000002'::uuid,
     'Oakley Flak 2.0', 'Kính mát thể thao chống UV', 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000004'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid,
     'b2000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Ray-Ban Wayfarer', 'Gọng wayfarer kinh điển', 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000005'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid,
     'b2000000-0000-0000-0000-000000000004'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Tròng đa tròng Nikon', 'Tròng đa tròng cho người lão thị', 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. PRODUCT_VARIANTS
-- -----------------------------------------------------------------------------
INSERT INTO "PRODUCT_VARIANTS" ("Id", "ProductId", "Color", "Size", "Material", "Price", "Status", "ImageUrl")
VALUES
    ('b8000000-0000-0000-0000-000000000001'::uuid, 'b7000000-0000-0000-0000-000000000001'::uuid, 'Đen', 'M', 'Kim loại', 850000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000002'::uuid, 'b7000000-0000-0000-0000-000000000001'::uuid, 'Bạc', 'L', 'Kim loại', 900000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000003'::uuid, 'b7000000-0000-0000-0000-000000000003'::uuid, 'Đen bóng', 'M', 'Nhựa', 1200000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000004'::uuid, 'b7000000-0000-0000-0000-000000000003'::uuid, 'Xanh navy', 'L', 'Nhựa', 1250000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000005'::uuid, 'b7000000-0000-0000-0000-000000000004'::uuid, 'Đen', 'S', 'Nhựa acetate', 750000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000006'::uuid, 'b7000000-0000-0000-0000-000000000004'::uuid, 'Tortoise', 'M', 'Nhựa acetate', 780000.00, 'Active', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. LensVariant (tròng kính - bảng migration tạo tên "LensVariant", FK COMBO_ITEMS tham chiếu đây)
-- -----------------------------------------------------------------------------
INSERT INTO "LensVariant" ("Id", "ProductId", "DoCau", "DoTru", "ChiSoKhucXa", "Price", "Status", "ImageUrl")
VALUES
    ('b9000000-0000-0000-0000-000000000001'::uuid, 'b7000000-0000-0000-0000-000000000002'::uuid, -2.00, NULL, NULL, 250000.00, 'Active', NULL),
    ('b9000000-0000-0000-0000-000000000002'::uuid, 'b7000000-0000-0000-0000-000000000002'::uuid, -3.50, NULL, NULL, 280000.00, 'Active', NULL),
    ('b9000000-0000-0000-0000-000000000003'::uuid, 'b7000000-0000-0000-0000-000000000005'::uuid, NULL, 2.00, 1.5, 450000.00, 'Active', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11. COMBO_ITEMS (ComboId, ProductVariantId hoặc LensesVariantId)
-- -----------------------------------------------------------------------------
INSERT INTO "COMBO_ITEMS" ("Id", "ComboId", "ProductVariantId", "LensesVariantId", "Quantity")
VALUES
    ('ba000000-0000-0000-0000-000000000001'::uuid, 'b6000000-0000-0000-0000-000000000001'::uuid, 'b8000000-0000-0000-0000-000000000001'::uuid, NULL, 1),
    ('ba000000-0000-0000-0000-000000000002'::uuid, 'b6000000-0000-0000-0000-000000000001'::uuid, NULL, 'b9000000-0000-0000-0000-000000000001'::uuid, 1),
    ('ba000000-0000-0000-0000-000000000003'::uuid, 'b6000000-0000-0000-0000-000000000002'::uuid, NULL, NULL, 1)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 12. CUSTOMERS (UserId)
-- -----------------------------------------------------------------------------
INSERT INTO "CUSTOMERS" ("Id", "UserId", "FullName", "Phone", "Gender", "DateOfBirth", "Address", "City", "CreatedAt", "UpdatedAt")
VALUES
    ('bb000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Nguyễn Văn Khách', '0912345678', 'Nam', '1990-05-15', '123 Đường ABC', 'TP.HCM', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('bb000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid,
     'Trần Thị Lan', '0987654321', 'Nữ', '1985-08-20', '456 Nguyễn Huệ', 'TP.HCM', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('bb000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid,
     'Lê Văn Minh', '0978123456', 'Nam', '1995-03-10', '789 Lê Lợi', 'Hà Nội', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13. SLOTS
-- -----------------------------------------------------------------------------
INSERT INTO "SLOTS" ("Id", "StartTime", "EndTime", "Date", "Status", "Note")
VALUES
    ('bc000000-0000-0000-0000-000000000001'::uuid,
     (CURRENT_DATE + TIME '08:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '08:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', 'Slot sáng'),
    ('bc000000-0000-0000-0000-000000000002'::uuid,
     (CURRENT_DATE + TIME '09:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '09:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', NULL),
    ('bc000000-0000-0000-0000-000000000003'::uuid,
     (CURRENT_DATE + TIME '10:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '10:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', NULL),
    ('bc000000-0000-0000-0000-000000000004'::uuid,
     (CURRENT_DATE + TIME '14:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '14:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', 'Slot chiều'),
    ('bc000000-0000-0000-0000-000000000005'::uuid,
     (CURRENT_DATE + TIME '15:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '15:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 14. PRESCRIPTIONS (CustomerId, ServiceId)
-- -----------------------------------------------------------------------------
INSERT INTO "PRESCRIPTIONS" ("Id", "CustomerId", "ServiceId", "CangKinh", "BanLe", "VienGong", "ChanVeMui", "CauGong", "DuoiGong", "Note", "CreatedAt")
VALUES
    ('bd000000-0000-0000-0000-000000000001'::uuid, 'bb000000-0000-0000-0000-000000000001'::uuid, 'b5000000-0000-0000-0000-000000000001'::uuid,
     '-2.00', '-1.50', NULL, NULL, NULL, NULL, 'Đo mắt lần đầu', NOW() AT TIME ZONE 'UTC'),
    ('bd000000-0000-0000-0000-000000000002'::uuid, 'bb000000-0000-0000-0000-000000000002'::uuid, 'b5000000-0000-0000-0000-000000000001'::uuid,
     '-1.00', '-0.75', NULL, NULL, NULL, NULL, 'Khám định kỳ', NOW() AT TIME ZONE 'UTC'),
    ('bd000000-0000-0000-0000-000000000003'::uuid, 'bb000000-0000-0000-0000-000000000003'::uuid, 'b5000000-0000-0000-0000-000000000001'::uuid,
     '-4.00', '-3.50', NULL, NULL, NULL, NULL, 'Cận nặng', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 15. CARTS (CustomerId, ServiceId?, SlotId?)
-- -----------------------------------------------------------------------------
INSERT INTO "CARTS"
("Id", "CustomerId", "ServiceId", "TotalAmount", "Status", "CreatedAt")
VALUES
(
    'be000000-0000-0000-0000-000000000001'::uuid,
    'bb000000-0000-0000-0000-000000000001'::uuid,
    'b5000000-0000-0000-0000-000000000001'::uuid,
    50000.00,
    'Pending',
    NOW() AT TIME ZONE 'UTC'
),
(
    'be000000-0000-0000-0000-000000000002'::uuid,
    'bb000000-0000-0000-0000-000000000002'::uuid,
    NULL,
    2030000.00,
    'Pending',
    NOW() AT TIME ZONE 'UTC'
),
(
    'be000000-0000-0000-0000-000000000003'::uuid,
    'bb000000-0000-0000-0000-000000000003'::uuid,
    'b5000000-0000-0000-0000-000000000003'::uuid,
    30000.00,
    'Pending',
    NOW() AT TIME ZONE 'UTC'
)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 16. CART_ITEMS (CartId, ProductVariantId?, LensesVariantId?, ComboItemId?)
-- -----------------------------------------------------------------------------
INSERT INTO "CART_ITEMS"
("Id", "CartId", "ProductVariantId", "LensesVariantId", "ComboItemId", "Quantity", "UnitPrice", "Note")
VALUES
    ('bf000000-0000-0000-0000-000000000001'::uuid,
     'be000000-0000-0000-0000-000000000001'::uuid,
     NULL, NULL, NULL, 1, 50000.00, 'Dịch vụ đo mắt'),

    ('bf000000-0000-0000-0000-000000000002'::uuid,
     'be000000-0000-0000-0000-000000000002'::uuid,
     'b8000000-0000-0000-0000-000000000003'::uuid,
     NULL, NULL, 1, 1200000.00, NULL),

    -- ✅ FIX Ở ĐÂY
    ('bf000000-0000-0000-0000-000000000003'::uuid,
     'be000000-0000-0000-0000-000000000002'::uuid,
     NULL,
     'b9000000-0000-0000-0000-000000000002'::uuid,
     NULL,  -- ← thêm ComboItemId
     1,
     280000.00,
     NULL),

    ('bf000000-0000-0000-0000-000000000004'::uuid,
     'be000000-0000-0000-0000-000000000002'::uuid,
     'b8000000-0000-0000-0000-000000000005'::uuid,
     NULL, NULL, 1, 750000.00, NULL),

    ('bf000000-0000-0000-0000-000000000005'::uuid,
     'be000000-0000-0000-0000-000000000003'::uuid,
     NULL, NULL, NULL, 1, 30000.00, 'Vệ sinh kính')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 17. ORDERS (CustomerId, PromotionId?, ServiceId?)
-- -----------------------------------------------------------------------------
INSERT INTO "ORDERS"
("Id", "CustomerId", "PromotionId", "ServiceId",
 "Status", "TotalAmount", "DiscountAmount",
 "OrderDate", "ShippingAddress", "ShippingPhone", "Note")
VALUES
(
    'c1000000-0000-0000-0000-000000000001'::uuid,
    'bb000000-0000-0000-0000-000000000001'::uuid,
    'b4000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Completed',
    935000.00,
    85000.00,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days',
    '123 Đường ABC',
    '0912345678',
    'Giao giờ hành chính'
),
(
    'c1000000-0000-0000-0000-000000000002'::uuid,
    'bb000000-0000-0000-0000-000000000002'::uuid,
    NULL,
    NULL,
    'Completed',
    780000.00,
    0,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '5 days',
    '456 Nguyễn Huệ',
    '0987654321',
    NULL
),
(
    'c1000000-0000-0000-0000-000000000003'::uuid,
    'bb000000-0000-0000-0000-000000000003'::uuid,
    'b4000000-0000-0000-0000-000000000002'::uuid,
    NULL,
    'Processing',
    1450000.00,
    250000.00,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day',
    '789 Lê Lợi',
    '0978123456',
    'Gọi trước khi giao'
)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18. ORDER_ITEMS (OrderId, ProductVariantId?, LensesVariantId?, ComboItemId?)
-- -----------------------------------------------------------------------------
INSERT INTO "ORDER_ITEMS" ("Id", "OrderId", "ProductVariantId", "LensesVariantId", "ComboItemId", "Quantity", "UnitPrice", "TotalPrice", "Note")
VALUES
    ('c2000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     'b8000000-0000-0000-0000-000000000001'::uuid, NULL, NULL, 1, 850000.00, 850000.00, NULL),
    ('c2000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid,
     'b8000000-0000-0000-0000-000000000006'::uuid, NULL, NULL, 1, 780000.00, 780000.00, NULL),
    ('c2000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
     'b8000000-0000-0000-0000-000000000003'::uuid, NULL, NULL, 1, 1200000.00, 1200000.00, NULL),
    ('c2000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
     NULL, 'b9000000-0000-0000-0000-000000000001'::uuid, NULL, 1, 250000.00, 250000.00, NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 19. PAYMENTS (OrderId)
-- -----------------------------------------------------------------------------
INSERT INTO "PAYMENTS" ("Id", "OrderId", "Amount", "Method", "Status", "PaidAt", "Note")
VALUES
    ('c3000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     850000.00, 'Cash', 'Completed', (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days', NULL),
    ('c3000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid,
     780000.00, 'BankTransfer', 'Completed', (NOW() AT TIME ZONE 'UTC') - INTERVAL '5 days', NULL),
    ('c3000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
     1200000.00, 'Cash', 'Completed', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 20. RETURN_EXCHANGES (OrderId) - tùy chọn
-- -----------------------------------------------------------------------------
-- Không seed mặc định; thêm khi cần.

-- =============================================================================
-- 23. ELITE LENS — Brand, Products & Variants (map với mock data frontend)
-- ProductVariant Id phải khớp với variantId trong frontend/constants/products.ts
-- =============================================================================

INSERT INTO "BRANDS" ("Id", "Name", "Description", "Country", "Status")
VALUES ('ee000000-0000-0000-0000-000000000001'::uuid, 'Elite Lens', 'Premium eyewear brand', 'Vietnam', 'Active')
ON CONFLICT ("Id") DO NOTHING;

INSERT INTO "PRODUCTS" ("Id", "CategoryId", "BrandId", "WarrantyPolicyId", "Name", "Description", "Status", "ImageUrl", "CreatedAt", "UpdatedAt")
VALUES
  ('ee100001-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Aurora Titanium', 'Ultra-lightweight titanium frame with a sleek modern silhouette.', 'Active',
   'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100002-0000-0000-0000-000000000002'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Noir Classic', 'Timeless black acetate sunglasses with premium polarized lenses.', 'Active',
   'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100003-0000-0000-0000-000000000003'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Crystal Blue Shield', 'Advanced blue-light filtering lenses in a minimalist TR-90 frame.', 'Active',
   'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100004-0000-0000-0000-000000000004'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Riviera Aviator', 'A modern take on the classic aviator with premium metal construction.', 'Active',
   'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100005-0000-0000-0000-000000000005'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Vogue Cat-Eye', 'Bold tortoise acetate cat-eye frames for a fashion-forward look.', 'Active',
   'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100006-0000-0000-0000-000000000006'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Zen Round', 'Delicate round titanium frames with a rose gold finish.', 'Active',
   'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100007-0000-0000-0000-000000000007'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Sport Flex Pro', 'Lightweight, impact-resistant sport frames for active lifestyles.', 'Active',
   'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100008-0000-0000-0000-000000000008'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Milano Square', 'Bold rectangular acetate frames inspired by Italian craftsmanship.', 'Active',
   'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100009-0000-0000-0000-000000000009'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Aero Lite', 'Featherweight metal rounds with advanced blue-light filtering lenses.', 'Active',
   'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100010-0000-0000-0000-000000000010'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Shadow Stealth', 'Premium stealth-black titanium aviators with mirror-coated lenses.', 'Active',
   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- ProductVariant Id = ee200001..ee200010, phải khớp với variantId trong constants/products.ts
INSERT INTO "PRODUCT_VARIANTS" ("Id", "ProductId", "Color", "Size", "Material", "Price", "Status", "ImageUrl")
VALUES
  ('ee200001-0000-0000-0000-000000000001'::uuid, 'ee100001-0000-0000-0000-000000000001'::uuid, 'Gunmetal',     'Standard', 'Titanium',      289000.00, 'Active', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'),
  ('ee200002-0000-0000-0000-000000000002'::uuid, 'ee100002-0000-0000-0000-000000000002'::uuid, 'Matte Black',  'Standard', 'Acetate',       219000.00, 'Active', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'),
  ('ee200003-0000-0000-0000-000000000003'::uuid, 'ee100003-0000-0000-0000-000000000003'::uuid, 'Crystal Clear','Standard', 'TR-90',         199000.00, 'Active', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80'),
  ('ee200004-0000-0000-0000-000000000004'::uuid, 'ee100004-0000-0000-0000-000000000004'::uuid, 'Gold',         'Standard', 'Metal',         329000.00, 'Active', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80'),
  ('ee200005-0000-0000-0000-000000000005'::uuid, 'ee100005-0000-0000-0000-000000000005'::uuid, 'Tortoise',     'Standard', 'Acetate',       259000.00, 'Active', 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80'),
  ('ee200006-0000-0000-0000-000000000006'::uuid, 'ee100006-0000-0000-0000-000000000006'::uuid, 'Rose Gold',    'Standard', 'Titanium',      239000.00, 'Active', 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80'),
  ('ee200007-0000-0000-0000-000000000007'::uuid, 'ee100007-0000-0000-0000-000000000007'::uuid, 'Matte Navy',   'Standard', 'TR-90',         179000.00, 'Active', 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80'),
  ('ee200008-0000-0000-0000-000000000008'::uuid, 'ee100008-0000-0000-0000-000000000008'::uuid, 'Havana Brown', 'Standard', 'Acetate',       299000.00, 'Active', 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80'),
  ('ee200009-0000-0000-0000-000000000009'::uuid, 'ee100009-0000-0000-0000-000000000009'::uuid, 'Silver',       'Standard', 'Metal',         269000.00, 'Active', 'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80'),
  ('ee200010-0000-0000-0000-000000000010'::uuid, 'ee100010-0000-0000-0000-000000000010'::uuid, 'Matte Black',  'Standard', 'Titanium',      349000.00, 'Active', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 21. EYE_RESULTS (OrderId, StaffId)
-- -----------------------------------------------------------------------------
INSERT INTO "EYE_RESULTS" ("Id", "OrderId", "StaffId", "EyeLeft", "EyeRight", "Vien", "Loan", "Can", "Note")
VALUES
    ('c4000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-2.00', '-1.75', true, false, 10, 'Khám tổng quát'),
    ('c4000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-0.75', '-1.00', true, false, 10, NULL),
    ('c4000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-3.00', '-2.50', true, false, 9, 'Cận trung bình')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 22. NOTIFICATIONS (UserId)
-- -----------------------------------------------------------------------------
INSERT INTO "NOTIFICATIONS" ("Id", "UserId", "Title", "Content", "Type", "Status", "LinkTo", "CreatedAt", "ReadAt")
VALUES
    ('c5000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Chào mừng', 'Cảm ơn bạn đã đăng ký!', 'Info', 'Unread', '/customer', NOW() AT TIME ZONE 'UTC', NULL),
    ('c5000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Đơn hàng đã giao', 'Đơn #001 đã được giao thành công.', 'Order', 'Read', '/customer/orders', (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day'),
    ('c5000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid,
     'Khuyến mãi mới', 'Giảm 20% cho đơn từ 1 triệu. Mã: GIAM20', 'Promo', 'Unread', '/customer', NOW() AT TIME ZONE 'UTC', NULL),
    ('c5000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid,
     'Đơn đang xử lý', 'Đơn #003 đang được chuẩn bị.', 'Order', 'Unread', '/customer/orders', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day', NULL)
ON CONFLICT ("Id") DO NOTHING;
