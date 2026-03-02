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
     'Khách hàng mẫu', '0912345678', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Email") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO "CATEGORIES" ("Id", "Name", "Description", "Status")
VALUES
    ('b1000000-0000-0000-0000-000000000001'::uuid, 'Gọng kính', 'Gọng kính cận, viễn, thời trang', 'Active'),
    ('b1000000-0000-0000-0000-000000000002'::uuid, 'Tròng kính', 'Tròng kính đơn tròng, đa tròng', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. BRANDS
-- -----------------------------------------------------------------------------
INSERT INTO "BRANDS" ("Id", "Name", "Description", "Country", "Status")
VALUES
    ('b2000000-0000-0000-0000-000000000001'::uuid, 'Ray-Ban', 'Thương hiệu kính mắt nổi tiếng', 'USA', 'Active'),
    ('b2000000-0000-0000-0000-000000000002'::uuid, 'Essilor', 'Tròng kính cao cấp', 'Pháp', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. WARRANTY_POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO "WARRANTY_POLICIES" ("Id", "Name", "Description", "WarrantyPeriodMonth", "Conditions", "Status")
VALUES
    ('b3000000-0000-0000-0000-000000000001'::uuid, 'Bảo hành 12 tháng', 'Bảo hành lỗi sản xuất', 12, 'Áp dụng cho sản phẩm chính hãng', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. PROMOTIONS
-- -----------------------------------------------------------------------------
INSERT INTO "PROMOTIONS" ("Id", "Code", "Name", "Description", "DiscountValue", "StartDate", "EndDate", "Status")
VALUES
    ('b4000000-0000-0000-0000-000000000001'::uuid, 'GIAM10', 'Giảm 10% đơn hàng', 'Áp dụng cho đơn từ 500k', 10.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '30 days')::timestamptz, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. SERVICES
-- -----------------------------------------------------------------------------
INSERT INTO "SERVICES" ("Id", "Name", "Description", "Price", "Status")
VALUES
    ('b5000000-0000-0000-0000-000000000001'::uuid, 'Đo mắt', 'Đo khám mắt tổng quát', 50000.00, 'Active'),
    ('b5000000-0000-0000-0000-000000000002'::uuid, 'Cắt kính', 'Cắt lắp tròng kính', 100000.00, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. COMBOS
-- -----------------------------------------------------------------------------
INSERT INTO "COMBOS" ("Id", "Name", "Description", "BasePrice", "StartDate", "EndDate", "Status")
VALUES
    ('b6000000-0000-0000-0000-000000000001'::uuid, 'Combo gọng + tròng', 'Gọng kính + tròng cận', 350000.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '90 days')::timestamptz, 'Active')
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
     'Tròng đơn tròng Essilor', 'Tròng kính đơn tròng chống trầy', 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. PRODUCT_VARIANTS
-- -----------------------------------------------------------------------------
INSERT INTO "PRODUCT_VARIANTS" ("Id", "ProductId", "Color", "Size", "Material", "Price", "Status", "ImageUrl")
VALUES
    ('b8000000-0000-0000-0000-000000000001'::uuid, 'b7000000-0000-0000-0000-000000000001'::uuid, 'Đen', 'M', 'Kim loại', 850000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000002'::uuid, 'b7000000-0000-0000-0000-000000000001'::uuid, 'Bạc', 'L', 'Kim loại', 900000.00, 'Active', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. LensVariant (tròng kính - bảng migration tạo tên "LensVariant", FK COMBO_ITEMS tham chiếu đây)
-- -----------------------------------------------------------------------------
INSERT INTO "LensVariant" ("Id", "ProductId", "DoCau", "DoTru", "ChiSoKhucXa", "Price", "Status", "ImageUrl")
VALUES
    ('b9000000-0000-0000-0000-000000000001'::uuid, 'b7000000-0000-0000-0000-000000000002'::uuid, -2.00, NULL, NULL, 250000.00, 'Active', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11. COMBO_ITEMS (ComboId, ProductVariantId hoặc LensesVariantId)
-- -----------------------------------------------------------------------------
INSERT INTO "COMBO_ITEMS" ("Id", "ComboId", "ProductVariantId", "LensesVariantId", "Quantity")
VALUES
    ('ba000000-0000-0000-0000-000000000001'::uuid, 'b6000000-0000-0000-0000-000000000001'::uuid, 'b8000000-0000-0000-0000-000000000001'::uuid, NULL, 1),
    ('ba000000-0000-0000-0000-000000000002'::uuid, 'b6000000-0000-0000-0000-000000000001'::uuid, NULL, 'b9000000-0000-0000-0000-000000000001'::uuid, 1)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 12. CUSTOMERS (UserId)
-- -----------------------------------------------------------------------------
INSERT INTO "CUSTOMERS" ("Id", "UserId", "FullName", "Phone", "Gender", "DateOfBirth", "Address", "City", "CreatedAt", "UpdatedAt")
VALUES
    ('bb000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Nguyễn Văn Khách', '0912345678', 'Nam', '1990-05-15', '123 Đường ABC', 'TP.HCM', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13. SLOTS
-- -----------------------------------------------------------------------------
INSERT INTO "SLOTS" ("Id", "StartTime", "EndTime", "Status", "Note")
VALUES
    ('bc000000-0000-0000-0000-000000000001'::uuid,
     (CURRENT_DATE + TIME '08:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '08:30') AT TIME ZONE 'UTC', 'Available', 'Slot sáng'),
    ('bc000000-0000-0000-0000-000000000002'::uuid,
     (CURRENT_DATE + TIME '09:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '09:30') AT TIME ZONE 'UTC', 'Available', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 14. PRESCRIPTIONS (CustomerId, ServiceId)
-- -----------------------------------------------------------------------------
INSERT INTO "PRESCRIPTIONS" ("Id", "CustomerId", "ServiceId", "CangKinh", "BanLe", "VienGong", "ChanVeMui", "CauGong", "DuoiGong", "Note", "CreatedAt")
VALUES
    ('bd000000-0000-0000-0000-000000000001'::uuid, 'bb000000-0000-0000-0000-000000000001'::uuid, 'b5000000-0000-0000-0000-000000000001'::uuid,
     '-2.00', '-1.50', NULL, NULL, NULL, NULL, 'Đo mắt lần đầu', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 15. CARTS (CustomerId, ServiceId?, SlotId?)
-- -----------------------------------------------------------------------------
INSERT INTO "CARTS" ("Id", "CustomerId", "ServiceId", "SlotId", "TotalAmount", "Status", "CreatedAt")
VALUES
    ('be000000-0000-0000-0000-000000000001'::uuid, 'bb000000-0000-0000-0000-000000000001'::uuid,
     'b5000000-0000-0000-0000-000000000001'::uuid, 'bc000000-0000-0000-0000-000000000001'::uuid,
     50000.00, 'Pending', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 16. CART_ITEMS (CartId, ProductVariantId?, LensesVariantId?, ComboItemId?)
-- -----------------------------------------------------------------------------
INSERT INTO "CART_ITEMS" ("Id", "CartId", "ProductVariantId", "LensesVariantId", "ComboItemId", "Quantity", "UnitPrice", "Note")
VALUES
    ('bf000000-0000-0000-0000-000000000001'::uuid, 'be000000-0000-0000-0000-000000000001'::uuid,
     NULL, NULL, NULL, 1, 50000.00, 'Dịch vụ đo mắt')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 17. ORDERS (CustomerId, PromotionId?, ServiceId?, SlotId?)
-- -----------------------------------------------------------------------------
INSERT INTO "ORDERS" ("Id", "CustomerId", "PromotionId", "ServiceId", "SlotId", "Status", "TotalAmount", "DiscountAmount", "FinalAmount", "OrderDate", "ShippingAddress", "ShippingPhone", "Note")
VALUES
    ('c1000000-0000-0000-0000-000000000001'::uuid, 'bb000000-0000-0000-0000-000000000001'::uuid,
     'b4000000-0000-0000-0000-000000000001'::uuid, NULL, NULL,
     'Completed', 935000.00, 85000.00, 850000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days',
     '123 Đường ABC', '0912345678', 'Giao giờ hành chính')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18. ORDER_ITEMS (OrderId, ProductVariantId?, LensesVariantId?, ComboItemId?)
-- -----------------------------------------------------------------------------
INSERT INTO "ORDER_ITEMS" ("Id", "OrderId", "ProductVariantId", "LensesVariantId", "ComboItemId", "Quantity", "UnitPrice", "TotalPrice", "Note")
VALUES
    ('c2000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     'b8000000-0000-0000-0000-000000000001'::uuid, NULL, NULL, 1, 850000.00, 850000.00, NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 19. PAYMENTS (OrderId)
-- -----------------------------------------------------------------------------
INSERT INTO "PAYMENTS" ("Id", "OrderId", "Amount", "Method", "Status", "PaidAt", "Note")
VALUES
    ('c3000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     850000.00, 'Cash', 'Completed', (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 20. RETURN_EXCHANGES (OrderId) - tùy chọn
-- -----------------------------------------------------------------------------
-- Không seed mặc định; thêm khi cần.

-- -----------------------------------------------------------------------------
-- 21. EYE_RESULTS (OrderId, StaffId)
-- -----------------------------------------------------------------------------
INSERT INTO "EYE_RESULTS" ("Id", "OrderId", "StaffId", "EyeLeft", "EyeRight", "Vien", "Loan", "Can", "Note")
VALUES
    ('c4000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-2.00', '-1.75', true, false, 10, 'Khám tổng quát')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 22. NOTIFICATIONS (UserId)
-- -----------------------------------------------------------------------------
INSERT INTO "NOTIFICATIONS" ("Id", "UserId", "Title", "Content", "Type", "Status", "LinkTo", "CreatedAt", "ReadAt")
VALUES
    ('c5000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Chào mừng', 'Cảm ơn bạn đã đăng ký!', 'Info', 'Unread', '/customer', NOW() AT TIME ZONE 'UTC', NULL)
ON CONFLICT ("Id") DO NOTHING;
