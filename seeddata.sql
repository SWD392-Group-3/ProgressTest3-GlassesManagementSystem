-- =============================================================================
-- Seed Data for Glasses Management System (PostgreSQL)
-- Run after migrations (database GlassesDb with all tables created).
-- How to run: psql -U postgres -d GlassesDb -f seeddata.sql
-- Or open in pgAdmin and Execute.
-- Password for all seed users: password
-- All status values stored in English (Available, Booked, Pending, Paid, etc.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS (password: password)
-- -----------------------------------------------------------------------------
INSERT INTO "USERS" (
    "Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "Status", "CreatedAt", "UpdatedAt"
)
VALUES
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'admin@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Admin', NULL, 'Admin', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'sales@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Sales Staff', '0901234567', 'Sales', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000003'::uuid, 'customer@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Sample Customer', '0912345678', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000004'::uuid, 'customer2@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Tran Thi Lan', '0987654321', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000005'::uuid, 'customer3@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Le Van Minh', '0978123456', 'Customer', 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000006'::uuid, 'operation@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Operation Staff', '0900000000', 'Operation', 'Active',
     NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('a0000000-0000-0000-0000-000000000007'::uuid, 'manager@example.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Store Manager', '0901111111', 'Manager', 'Active',
     NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Email") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO "CATEGORIES" ("Id", "Name", "Description", "Status")
VALUES
    ('b1000000-0000-0000-0000-000000000001'::uuid, 'Optical Frames', 'Prescription and fashion frames', 'Active'),
    ('b1000000-0000-0000-0000-000000000002'::uuid, 'Lenses', 'Single vision, multifocal lenses', 'Active'),
    ('b1000000-0000-0000-0000-000000000003'::uuid, 'Sunglasses', 'Fashion and UV protection sunglasses', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. BRANDS
-- -----------------------------------------------------------------------------
INSERT INTO "BRANDS" ("Id", "Name", "Description", "Country", "Status")
VALUES
    ('b2000000-0000-0000-0000-000000000001'::uuid, 'Ray-Ban', 'Iconic eyewear brand', 'USA', 'Active'),
    ('b2000000-0000-0000-0000-000000000002'::uuid, 'Essilor', 'Premium lenses', 'France', 'Active'),
    ('b2000000-0000-0000-0000-000000000003'::uuid, 'Oakley', 'Sport and impact-resistant eyewear', 'USA', 'Active'),
    ('b2000000-0000-0000-0000-000000000004'::uuid, 'Nikon', 'Japanese optical lenses', 'Japan', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. WARRANTY_POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO "WARRANTY_POLICIES" ("Id", "Name", "Description", "WarrantyPeriodMonth", "Conditions", "Status")
VALUES
    ('b3000000-0000-0000-0000-000000000001'::uuid, '12-month warranty', 'Manufacturing defect warranty', 12, 'Applies to authentic products', 'Active'),
    ('b3000000-0000-0000-0000-000000000002'::uuid, '24-month warranty', 'Extended warranty', 24, 'Premium products', 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. PROMOTIONS
-- -----------------------------------------------------------------------------
INSERT INTO "PROMOTIONS" ("Id", "Code", "Name", "Description", "DiscountValue", "StartDate", "EndDate", "Status")
VALUES
    ('b4000000-0000-0000-0000-000000000001'::uuid, 'SAVE10', '10% off order', 'Orders from 500k', 10.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '30 days')::timestamptz, 'Active'),
    ('b4000000-0000-0000-0000-000000000002'::uuid, 'SAVE20', '20% off orders from 1M', 'Orders from 1,000,000 VND', 20.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '60 days')::timestamptz, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. SERVICES
-- -----------------------------------------------------------------------------
INSERT INTO "SERVICES" ("Id", "Name", "Description", "Price", "Status")
VALUES
    ('b5000000-0000-0000-0000-000000000001'::uuid, 'Eye exam', 'General eye examination', 50000.00, 'Active'),
    ('b5000000-0000-0000-0000-000000000002'::uuid, 'Lens fitting', 'Cut and fit lenses', 100000.00, 'Active'),
    ('b5000000-0000-0000-0000-000000000003'::uuid, 'Glasses cleaning', 'Cleaning and maintenance', 30000.00, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. COMBOS
-- -----------------------------------------------------------------------------
INSERT INTO "COMBOS" ("Id", "Name", "Description", "BasePrice", "StartDate", "EndDate", "Status")
VALUES
    ('b6000000-0000-0000-0000-000000000001'::uuid, 'Frame + Lenses combo', 'Frame plus prescription lenses', 350000.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '90 days')::timestamptz, 'Active'),
    ('b6000000-0000-0000-0000-000000000002'::uuid, 'Eye exam + Lens fitting', 'Eye exam and lens fitting', 120000.00,
     ((NOW() AT TIME ZONE 'UTC')::date)::timestamptz, ((NOW() AT TIME ZONE 'UTC')::date + INTERVAL '45 days')::timestamptz, 'Active')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. PRODUCTS (CategoryId, BrandId, WarrantyPolicyId)
-- -----------------------------------------------------------------------------
INSERT INTO "PRODUCTS" ("Id", "CategoryId", "BrandId", "WarrantyPolicyId", "Name", "Description", "UnitPrice", "Status", "ImageUrl", "CreatedAt", "UpdatedAt")
VALUES
    ('b7000000-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid,
     'b2000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Ray-Ban Classic Aviator', 'Classic aviator frame', 800000, 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000002'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid,
     'b2000000-0000-0000-0000-000000000002'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Essilor single vision', 'Single vision scratch-resistant lens', 700000, 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000003'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid,
     'b2000000-0000-0000-0000-000000000003'::uuid, 'b3000000-0000-0000-0000-000000000002'::uuid,
     'Oakley Flak 2.0', 'Sport sunglasses UV protection', 890000, 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000004'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid,
     'b2000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Ray-Ban Wayfarer', 'Classic wayfarer frame', 900000, 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('b7000000-0000-0000-0000-000000000005'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid,
     'b2000000-0000-0000-0000-000000000004'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
     'Nikon multifocal', 'Multifocal lens for presbyopia', 500000, 'Active', NULL, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. PRODUCT_VARIANTS
-- -----------------------------------------------------------------------------
INSERT INTO "PRODUCT_VARIANTS" ("Id", "ProductId", "Color", "Size", "Material", "Price", "Status", "ImageUrl")
VALUES
    ('b8000000-0000-0000-0000-000000000001'::uuid, 'b7000000-0000-0000-0000-000000000001'::uuid, 'Black', 'M', 'Metal', 850000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000002'::uuid, 'b7000000-0000-0000-0000-000000000001'::uuid, 'Silver', 'L', 'Metal', 900000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000003'::uuid, 'b7000000-0000-0000-0000-000000000003'::uuid, 'Matte black', 'M', 'Plastic', 1200000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000004'::uuid, 'b7000000-0000-0000-0000-000000000003'::uuid, 'Navy blue', 'L', 'Plastic', 1250000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000005'::uuid, 'b7000000-0000-0000-0000-000000000004'::uuid, 'Black', 'S', 'Acetate', 750000.00, 'Active', NULL),
    ('b8000000-0000-0000-0000-000000000006'::uuid, 'b7000000-0000-0000-0000-000000000004'::uuid, 'Tortoise', 'M', 'Acetate', 780000.00, 'Active', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. LENSES_VARIANTS
-- -----------------------------------------------------------------------------
INSERT INTO "LENSES_VARIANTS" ("Id", "ProductId", "DoCau", "DoTru", "ChiSoKhucXa", "Price", "Status", "ImageUrl")
VALUES
    ('b9000000-0000-0000-0000-000000000001'::uuid, 'b7000000-0000-0000-0000-000000000002'::uuid, -2.00, NULL, NULL, 250000.00, 'Active', NULL),
    ('b9000000-0000-0000-0000-000000000002'::uuid, 'b7000000-0000-0000-0000-000000000002'::uuid, -3.50, NULL, NULL, 280000.00, 'Active', NULL),
    ('b9000000-0000-0000-0000-000000000003'::uuid, 'b7000000-0000-0000-0000-000000000005'::uuid, NULL, 2.00, 1.5, 450000.00, 'Active', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11. COMBO_ITEMS (ComboId, ProductVariantId or LensesVariantId)
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
     'Sample Customer', '0912345678', 'Male', '1990-05-15', '123 ABC Street', 'Ho Chi Minh City', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('bb000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid,
     'Tran Thi Lan', '0987654321', 'Female', '1985-08-20', '456 Nguyen Hue', 'Ho Chi Minh City', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
    ('bb000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid,
     'Le Van Minh', '0978123456', 'Male', '1995-03-10', '789 Le Loi', 'Hanoi', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13. SLOTS (Status: English only - Available, Booked, Completed, Cancelled)
-- -----------------------------------------------------------------------------
INSERT INTO "SLOTS" ("Id", "StartTime", "EndTime", "Date", "Status", "Note")
VALUES
    ('bc000000-0000-0000-0000-000000000001'::uuid,
     (CURRENT_DATE + TIME '08:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '08:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', 'Morning slot'),
    ('bc000000-0000-0000-0000-000000000002'::uuid,
     (CURRENT_DATE + TIME '09:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '09:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', NULL),
    ('bc000000-0000-0000-0000-000000000003'::uuid,
     (CURRENT_DATE + TIME '10:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '10:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', NULL),
    ('bc000000-0000-0000-0000-000000000004'::uuid,
     (CURRENT_DATE + TIME '14:00') AT TIME ZONE 'UTC',
     (CURRENT_DATE + TIME '14:30') AT TIME ZONE 'UTC', '2026-03-03', 'Available', 'Afternoon slot'),
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
     '-2.00', '-1.50', NULL, NULL, NULL, NULL, 'First eye exam', NOW() AT TIME ZONE 'UTC'),
    ('bd000000-0000-0000-0000-000000000002'::uuid, 'bb000000-0000-0000-0000-000000000002'::uuid, 'b5000000-0000-0000-0000-000000000001'::uuid,
     '-1.00', '-0.75', NULL, NULL, NULL, NULL, 'Routine check', NOW() AT TIME ZONE 'UTC'),
    ('bd000000-0000-0000-0000-000000000003'::uuid, 'bb000000-0000-0000-0000-000000000003'::uuid, 'b5000000-0000-0000-0000-000000000001'::uuid,
     '-4.00', '-3.50', NULL, NULL, NULL, NULL, 'High myopia', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 15. CARTS (Status: Pending)
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
-- 16. CART_ITEMS
-- -----------------------------------------------------------------------------
INSERT INTO "CART_ITEMS"
("Id", "CartId", "ProductVariantId", "LensesVariantId", "ComboItemId", "Quantity", "UnitPrice", "Note")
VALUES
    ('bf000000-0000-0000-0000-000000000001'::uuid,
     'be000000-0000-0000-0000-000000000001'::uuid,
     NULL, NULL, NULL, 1, 50000.00, 'Eye exam service'),

    ('bf000000-0000-0000-0000-000000000002'::uuid,
     'be000000-0000-0000-0000-000000000002'::uuid,
     'b8000000-0000-0000-0000-000000000003'::uuid,
     NULL, NULL, 1, 1200000.00, NULL),

    ('bf000000-0000-0000-0000-000000000003'::uuid,
     'be000000-0000-0000-0000-000000000002'::uuid,
     NULL,
     'b9000000-0000-0000-0000-000000000002'::uuid,
     NULL,
     1,
     280000.00,
     NULL),

    ('bf000000-0000-0000-0000-000000000004'::uuid,
     'be000000-0000-0000-0000-000000000002'::uuid,
     'b8000000-0000-0000-0000-000000000005'::uuid,
     NULL, NULL, 1, 750000.00, NULL),

    ('bf000000-0000-0000-0000-000000000005'::uuid,
     'be000000-0000-0000-0000-000000000003'::uuid,
     NULL, NULL, NULL, 1, 30000.00, 'Glasses cleaning')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 17. ORDERS (Status: Pending | Paid | Confirmed | Shipped | Delivered | Completed | Cancelled | Rejected)
-- -----------------------------------------------------------------------------
INSERT INTO "ORDERS"
("Id", "CustomerId", "PromotionId",
 "Status", "TotalAmount", "DiscountAmount",
 "OrderDate", "ShippingAddress", "ShippingPhone", "Note")
VALUES
(
    'c1000000-0000-0000-0000-000000000001'::uuid,
    'bb000000-0000-0000-0000-000000000001'::uuid,
    'b4000000-0000-0000-0000-000000000001'::uuid,
    'Completed',
    935000.00,
    85000.00,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days',
    '123 ABC Street',
    '0912345678',
    'Business hours delivery'
),
(
    'c1000000-0000-0000-0000-000000000002'::uuid,
    'bb000000-0000-0000-0000-000000000002'::uuid,
    NULL,
    'Completed',
    780000.00,
    0,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '5 days',
    '456 Nguyen Hue',
    '0987654321',
    NULL
),
(
    'c1000000-0000-0000-0000-000000000003'::uuid,
    'bb000000-0000-0000-0000-000000000003'::uuid,
    'b4000000-0000-0000-0000-000000000002'::uuid,
    'Confirmed',
    1450000.00,
    250000.00,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day',
    '789 Le Loi',
    '0978123456',
    'Call before delivery'
)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18. ORDER_ITEMS
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
-- 19. PAYMENTS (Status: Paid | Failed)
-- -----------------------------------------------------------------------------
INSERT INTO "PAYMENTS" ("Id", "OrderId", "Amount", "Method", "Status", "PaidAt", "Note")
VALUES
    ('c3000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     850000.00, 'Cash', 'Paid', (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days', NULL),
    ('c3000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid,
     780000.00, 'BankTransfer', 'Paid', (NOW() AT TIME ZONE 'UTC') - INTERVAL '5 days', NULL),
    ('c3000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
     1200000.00, 'Cash', 'Paid', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day', NULL)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 20. RETURN_EXCHANGES (Status: Pending | ApprovedBySales | Rejected | ReceivedByOperation | Completed)
-- -----------------------------------------------------------------------------
INSERT INTO "RETURN_EXCHANGES"
("Id", "OrderId", "CustomerId", "Reason", "Status", "RejectionReason",
 "CreatedAt", "ReviewedBySalesAt", "ReceivedByOperationAt", "ResolvedAt")
VALUES
(
    'c6000000-0000-0000-0000-000000000001'::uuid,
    'c1000000-0000-0000-0000-000000000001'::uuid,
    'bb000000-0000-0000-0000-000000000001'::uuid,
    'Light scratch on lens, would like to exchange for another product.',
    'ApprovedBySales',
    NULL,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '3 days',
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days',
    NULL,
    NULL
),
(
    'c6000000-0000-0000-0000-000000000002'::uuid,
    'c1000000-0000-0000-0000-000000000002'::uuid,
    'bb000000-0000-0000-0000-000000000002'::uuid,
    'Not satisfied with style, would like to return for refund.',
    'Pending',
    NULL,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 days',
    NULL,
    NULL,
    NULL
)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 21. RETURN_EXCHANGE_ITEMS (Status: Pending | Approved | Rejected | Received)
-- -----------------------------------------------------------------------------
INSERT INTO "RETURN_EXCHANGE_ITEMS"
("Id", "ReturnExchangeId", "OrderItemId", "Quantity", "Reason", "Status",
 "Note", "InspectionResult", "CreatedAt")
VALUES
(
    'c7000000-0000-0000-0000-000000000001'::uuid,
    'c6000000-0000-0000-0000-000000000001'::uuid,
    'c2000000-0000-0000-0000-000000000001'::uuid,
    1,
    'Lens scratch, customer requested exchange.',
    'Approved',
    'Waiting for customer to send item back to store.',
    NULL,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '3 days'
),
(
    'c7000000-0000-0000-0000-000000000002'::uuid,
    'c6000000-0000-0000-0000-000000000002'::uuid,
    'c2000000-0000-0000-0000-000000000002'::uuid,
    1,
    'Does not fit well, customer requested return.',
    'Pending',
    NULL,
    NULL,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 days'
)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 22. RETURN_EXCHANGE_IMAGES
-- -----------------------------------------------------------------------------
INSERT INTO "RETURN_EXCHANGE_IMAGES"
("Id", "ReturnExchangeItemId", "ImageUrl", "UploadedByRole", "UploadedByUserId",
 "UploadedAt", "Description")
VALUES
(
    'c8000000-0000-0000-0000-000000000001'::uuid,
    'c7000000-0000-0000-0000-000000000001'::uuid,
    'https://example.com/returns/scratch-1.jpg',
    'Customer',
    'a0000000-0000-0000-0000-000000000003'::uuid,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '3 days',
    'Photo of scratch on lens.'
),
(
    'c8000000-0000-0000-0000-000000000002'::uuid,
    'c7000000-0000-0000-0000-000000000002'::uuid,
    'https://example.com/returns/not-fit-1.jpg',
    'Customer',
    'a0000000-0000-0000-0000-000000000004'::uuid,
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 days',
    'Photo of glasses when worn, poor fit.'
)
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 23. RETURN_EXCHANGE_HISTORIES
-- -----------------------------------------------------------------------------
INSERT INTO "RETURN_EXCHANGE_HISTORIES"
("Id", "ReturnExchangeId", "Action", "OldStatus", "NewStatus", "Comment",
 "PerformedByUserId", "PerformedByRole", "PerformedAt")
VALUES
(
    'c9000000-0000-0000-0000-000000000001'::uuid,
    'c6000000-0000-0000-0000-000000000001'::uuid,
    'Created',
    NULL,
    'Pending',
    'Customer created exchange request.',
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'Customer',
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '3 days'
),
(
    'c9000000-0000-0000-0000-000000000002'::uuid,
    'c6000000-0000-0000-0000-000000000001'::uuid,
    'ReviewedBySales',
    'Pending',
    'ApprovedBySales',
    'Sales staff approved exchange.',
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'Sales',
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days'
),
(
    'c9000000-0000-0000-0000-000000000003'::uuid,
    'c6000000-0000-0000-0000-000000000002'::uuid,
    'Created',
    NULL,
    'Pending',
    'Customer requested return and refund.',
    'a0000000-0000-0000-0000-000000000004'::uuid,
    'Customer',
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 days'
)
ON CONFLICT ("Id") DO NOTHING;

-- =============================================================================
-- 24. ELITE LENS — Brand, Products & Variants (align with frontend mock data)
-- =============================================================================
INSERT INTO "BRANDS" ("Id", "Name", "Description", "Country", "Status")
VALUES ('ee000000-0000-0000-0000-000000000001'::uuid, 'Elite Lens', 'Premium eyewear brand', 'Vietnam', 'Active')
ON CONFLICT ("Id") DO NOTHING;

INSERT INTO "PRODUCTS" ("Id", "CategoryId", "BrandId", "WarrantyPolicyId", "Name", "Description", "UnitPrice", "Status", "ImageUrl", "CreatedAt", "UpdatedAt")
VALUES
  ('ee100001-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Aurora Titanium', 'Ultra-lightweight titanium frame with a sleek modern silhouette.', 1200000.00, 'Active',
   'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100002-0000-0000-0000-000000000002'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Noir Classic', 'Timeless black acetate sunglasses with premium polarized lenses.', 950000.00, 'Active',
   'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100003-0000-0000-0000-000000000003'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Crystal Blue Shield', 'Advanced blue-light filtering lenses in a minimalist TR-90 frame.', 890000.00, 'Active',
   'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100004-0000-0000-0000-000000000004'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Riviera Aviator', 'A modern take on the classic aviator with premium metal construction.', 1100000.00, 'Active',
   'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100005-0000-0000-0000-000000000005'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Vogue Cat-Eye', 'Bold tortoise acetate cat-eye frames for a fashion-forward look.', 990000.00, 'Active',
   'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100006-0000-0000-0000-000000000006'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Zen Round', 'Delicate round titanium frames with a rose gold finish.', 1050000.00, 'Active',
   'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100007-0000-0000-0000-000000000007'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Sport Flex Pro', 'Lightweight, impact-resistant sport frames for active lifestyles.', 970000.00, 'Active',
   'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100008-0000-0000-0000-000000000008'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Milano Square', 'Bold rectangular acetate frames inspired by Italian craftsmanship.', 990000.00, 'Active',
   'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100009-0000-0000-0000-000000000009'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Aero Lite', 'Featherweight metal rounds with advanced blue-light filtering lenses.', 930000.00, 'Active',
   'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
  ('ee100010-0000-0000-0000-000000000010'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'ee000000-0000-0000-0000-000000000001'::uuid, 'b3000000-0000-0000-0000-000000000001'::uuid,
   'Shadow Stealth', 'Premium stealth-black titanium aviators with mirror-coated lenses.', 1250000.00, 'Active',
   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

INSERT INTO "PRODUCT_VARIANTS" ("Id", "ProductId", "Color", "Size", "Material", "Price", "Status", "ImageUrl")
VALUES
  ('ee200001-0000-0000-0000-000000000001'::uuid, 'ee100001-0000-0000-0000-000000000001'::uuid, 'Gunmetal',     'Standard', 'Titanium',      289000.00, 'Active', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'),
  ('ee200002-0000-0000-0000-000000000002'::uuid, 'ee100002-0000-0000-0000-000000000002'::uuid, 'Matte Black',  'Standard', 'Acetate',       219000.00, 'Active', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'),
  ('ee200003-0000-0000-0000-000000000003'::uuid, 'ee100003-0000-0000-0000-000000000003'::uuid, 'Crystal Clear','Standard', 'TR-90',         199000.00, 'Active', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80'),
  ('ee200004-0000-0000-0000-000000000004'::uuid, 'ee100004-0000-0000-0000-000000000004'::uuid, 'Gold',         'Standard', 'Metal',         329000.00, 'Active', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80'),
  ('ee200005-0000-0000-0000-000000000005'::uuid, 'ee100005-0000-0000-0000-000000000005'::uuid, 'Tortoise',     'Standard', 'Acetate',       259000.00, 'Active', 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80'),
  ('ee200006-0000-0000-0000-0000-000000000006'::uuid, 'ee100006-0000-0000-0000-000000000006'::uuid, 'Rose Gold',    'Standard', 'Titanium',      239000.00, 'Active', 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80'),
  ('ee200007-0000-0000-0000-0000-000000000007'::uuid, 'ee100007-0000-0000-0000-000000000007'::uuid, 'Matte Navy',   'Standard', 'TR-90',         179000.00, 'Active', 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80'),
  ('ee200008-0000-0000-0000-0000-000000000008'::uuid, 'ee100008-0000-0000-0000-000000000008'::uuid, 'Havana Brown', 'Standard', 'Acetate',       299000.00, 'Active', 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80'),
  ('ee200009-0000-0000-0000-0000-000000000009'::uuid, 'ee100009-0000-0000-0000-000000000009'::uuid, 'Silver',       'Standard', 'Metal',         269000.00, 'Active', 'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80'),
  ('ee200010-0000-0000-0000-0000-000000000010'::uuid, 'ee100010-0000-0000-0000-000000000010'::uuid, 'Matte Black',  'Standard', 'Titanium',      349000.00, 'Active', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 25. EYE_RESULTS
-- -----------------------------------------------------------------------------
INSERT INTO "EYE_RESULTS" ("Id", "OrderId", "StaffId", "EyeLeft", "EyeRight", "Vien", "Loan", "Can", "Note")
VALUES
    ('c4000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-2.00', '-1.75', true, false, 10, 'General exam'),
    ('c4000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-0.75', '-1.00', true, false, 10, NULL),
    ('c4000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid,
     '-3.00', '-2.50', true, false, 9, 'Moderate myopia')
ON CONFLICT ("Id") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 26. NOTIFICATIONS (Status: unread | read - lowercase to match backend)
-- -----------------------------------------------------------------------------
INSERT INTO "NOTIFICATIONS" ("Id", "UserId", "Title", "Content", "Type", "Status", "LinkTo", "CreatedAt", "ReadAt")
VALUES
    ('c5000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Welcome', 'Thank you for signing up!', 'Info', 'unread', '/customer', NOW() AT TIME ZONE 'UTC', NULL),
    ('c5000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid,
     'Order delivered', 'Order #001 has been delivered successfully.', 'Order', 'read', '/customer/orders', (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day'),
    ('c5000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid,
     'New promotion', '20% off orders from 1M. Code: SAVE20', 'Promo', 'unread', '/customer', NOW() AT TIME ZONE 'UTC', NULL),
    ('c5000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid,
     'Order in progress', 'Order #003 is being prepared.', 'Order', 'unread', '/customer/orders', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day', NULL)
ON CONFLICT ("Id") DO NOTHING;
