-- TRUNCATE existing tables if needed (optional)
-- TRUNCATE TABLE "Permissions", "AspNetRoles", "AspNetUsers", "Categories", "Brands", "Products", "ProductVariants", "ProductColor", "ProductSize", "ProductSpecifications", "Reviews", "ReviewImages", "Abouts", "ValueItem", "HistoryParagraph", "TeamMember", "Contacts", "SocialLink", "FaqItem", "ProductImages", "Banners" RESTART IDENTITY CASCADE;

-- 1. Permissions
INSERT INTO "Permissions" ("Id", "Name", "Description", "CreatedAt", "UpdatedAt") VALUES
(gen_random_uuid(), 'ViewUsers', 'Can view user list', NOW(), NOW()),
(gen_random_uuid(), 'CreateUser', 'Can create new users', NOW(), NOW()),
(gen_random_uuid(), 'EditUser', 'Can edit user details', NOW(), NOW()),
(gen_random_uuid(), 'DeleteUser', 'Can delete users', NOW(), NOW()),
(gen_random_uuid(), 'ViewProducts', 'Can view product list', NOW(), NOW()),
(gen_random_uuid(), 'CreateProduct', 'Can create new products', NOW(), NOW()),
(gen_random_uuid(), 'EditProduct', 'Can edit product details', NOW(), NOW()),
(gen_random_uuid(), 'DeleteProduct', 'Can delete products', NOW(), NOW()),
(gen_random_uuid(), 'ViewCategories', 'Can view category list', NOW(), NOW()),
(gen_random_uuid(), 'CreateCategory', 'Can create new categories', NOW(), NOW()),
(gen_random_uuid(), 'EditCategory', 'Can edit category details', NOW(), NOW()),
(gen_random_uuid(), 'DeleteCategory', 'Can delete categories', NOW(), NOW()),
(gen_random_uuid(), 'ViewOrders', 'Can view order list', NOW(), NOW()),
(gen_random_uuid(), 'CreateOrder', 'Can create new orders', NOW(), NOW()),
(gen_random_uuid(), 'EditOrder', 'Can edit order details', NOW(), NOW()),
(gen_random_uuid(), 'DeleteOrder', 'Can delete orders', NOW(), NOW()),
(gen_random_uuid(), 'ManageRoles', 'Can manage roles and permissions', NOW(), NOW()),
(gen_random_uuid(), 'ViewLogs', 'Can view system logs', NOW(), NOW()),
(gen_random_uuid(), 'ManageSettings', 'Can manage system settings', NOW(), NOW());

-- 2. Roles
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") VALUES
('d3b14561-23ea-4f24-9b16-41e976f4e68e', 'Admin', 'ADMIN', gen_random_uuid()::varchar),
('3f990a42-5ae7-4e98-8aa3-5246ec41a27e', 'Manager', 'MANAGER', gen_random_uuid()::varchar),
('33d712ce-2856-42d6-bb4d-176c483a31c5', 'Staff', 'STAFF', gen_random_uuid()::varchar),
('6b8b9393-2770-4cb1-b8ae-01f6aa916616', 'Customer', 'CUSTOMER', gen_random_uuid()::varchar);

-- 3. Users (Hash using a dummy value, you may need to reset password or replace with a real hash)
INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount", "FirstName", "LastName", "FullName", "CustomerLevel", "PromotionPoints", "Avatar", "CreatedAt", "UpdatedAt") VALUES
('5b2cbf42-9ee6-4bd2-aced-d54d24a984a9', 'admin@Ecommerce.com', 'ADMIN@ECOMMERCE.COM', 'admin@Ecommerce.com', 'ADMIN@ECOMMERCE.COM', true, 'AQAAAAIAAYagAAAAEPw0w2S...', gen_random_uuid()::varchar, gen_random_uuid()::varchar, false, false, true, 0, 'System', 'Administrator', 'System Administrator', 3, 1000, '/uploads/users/avatar-20250521154845412-fd9c4c.jpg', NOW(), NOW()),
('a0f2b38f-6f96-41f2-9844-469b828ea740', 'manager@Ecommerce.com', 'MANAGER@ECOMMERCE.COM', 'manager@Ecommerce.com', 'MANAGER@ECOMMERCE.COM', true, 'AQAAAAIAAYagAAAAEPw0w2S...', gen_random_uuid()::varchar, gen_random_uuid()::varchar, false, false, true, 0, 'Store', 'Manager', 'Store Manager', 2, 500, NULL, NOW(), NOW()),
('c830e2f5-26bf-4bfb-b8df-d8f99fc1e204', 'staff@Ecommerce.com', 'STAFF@ECOMMERCE.COM', 'staff@Ecommerce.com', 'STAFF@ECOMMERCE.COM', true, 'AQAAAAIAAYagAAAAEPw0w2S...', gen_random_uuid()::varchar, gen_random_uuid()::varchar, false, false, true, 0, 'Staff', 'Member', 'Staff Member', 1, 200, NULL, NOW(), NOW()),
('e74b34b7-df3a-44ef-a6cc-c76b1f2dbba1', 'customer@example.com', 'CUSTOMER@EXAMPLE.COM', 'customer@example.com', 'CUSTOMER@EXAMPLE.COM', true, 'AQAAAAIAAYagAAAAEPw0w2S...', gen_random_uuid()::varchar, gen_random_uuid()::varchar, false, false, true, 0, 'Regular', 'Customer', 'Regular Customer', 0, 50, NULL, NOW(), NOW());

-- 4. UserRoles
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES
('5b2cbf42-9ee6-4bd2-aced-d54d24a984a9', 'd3b14561-23ea-4f24-9b16-41e976f4e68e'),
('a0f2b38f-6f96-41f2-9844-469b828ea740', '3f990a42-5ae7-4e98-8aa3-5246ec41a27e'),
('c830e2f5-26bf-4bfb-b8df-d8f99fc1e204', '33d712ce-2856-42d6-bb4d-176c483a31c5'),
('e74b34b7-df3a-44ef-a6cc-c76b1f2dbba1', '6b8b9393-2770-4cb1-b8ae-01f6aa916616');

-- 5. Categories
INSERT INTO "Categories" ("Id", "Code", "Name", "Description", "Slug", "Image", "CreatedAt", "UpdatedAt") VALUES
('c1000000-0000-0000-0000-000000000001', 'DTDĐ', 'Điện Thoại Di Động', 'Các dòng điện thoại thông minh hiện đại', 'dien-thoai-di-dong', '/uploads/categories/dien-thoai-di-dong-20250806135102102-1a8c21.jpg', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000002', 'Laptop', 'Laptop', 'Máy tính xách tay và máy tính di động', 'laptop', '/uploads/categories/laptop-20250806135334578-e5f6f1.jpg', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000003', 'MTB', 'Máy Tính Bảng', 'Thiết bị máy tính di động màn hình lớn', 'may-tinh-bang', '/uploads/categories/may-tinh-bang-20250806135528696-3aa918.png', NOW(), NOW()),
('c4000000-0000-0000-0000-000000000004', 'PKCN', 'Phụ Kiện Công Nghệ', 'Phụ kiện điện tử và công nghệ', 'phu-kien-cong-nghe', '/uploads/categories/phukien_mobile-20250806135918105-e4120f.jpg', NOW(), NOW()),
('c5000000-0000-0000-0000-000000000005', 'MS', 'Âm Thanh', 'Tai nghe, loa và thiết bị âm thanh', 'am-thanh', '/uploads/categories/am_thanh-20250806140035285-d8bd3a.png', NOW(), NOW());

-- 6. Brands
INSERT INTO "Brands" ("Id", "Code", "Name", "Description", "Slug", "LogoUrl", "CreatedAt", "UpdatedAt") VALUES
('b1000000-0000-0000-0000-000000000001', 'Apple', 'Apple', 'Nhà sản xuất điện thoại và máy tính hàng đầu thế giới', 'apple', '/uploads/brands/apple-20250804141605152-f35842.png', NOW(), NOW()),
('b2000000-0000-0000-0000-000000000002', 'Samsung', 'Samsung', 'Thương hiệu điện tử hàng đầu Hàn Quốc', 'samsung', '/uploads/brands/samsung-20250804141704270-15eab4.png', NOW(), NOW()),
('b3000000-0000-0000-0000-000000000003', 'Sony', 'Sony', 'Chuyên sản xuất thiết bị điện tử chất lượng cao', 'sony', '/uploads/brands/sony-20250804141716260-f6dc0b.png', NOW(), NOW()),
('b4000000-0000-0000-0000-000000000004', 'Dell', 'Dell', 'Nhà sản xuất máy tính và thiết bị công nghệ', 'dell', '/uploads/brands/dell-20250804141613099-1e0e20.png', NOW(), NOW()),
('b5000000-0000-0000-0000-000000000005', 'Xiaomi', 'Xiaomi', 'Thương hiệu điện thoại Trung Quốc nổi tiếng', 'xiaomi', '/uploads/brands/xiaomi-20250804141728483-78b792.png', NOW(), NOW());

-- 7. Products (A few key products with fixed UUIDs to match below relations)
INSERT INTO "Products" ("Id", "Code", "Name", "Slug", "Sku", "Price", "SalePrice", "Image", "Description", "StockQuantity", "CategoryId", "BrandId", "Rating", "ReviewCount", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('p1000000-0000-0000-0000-000000000001', 'IP15PM', 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Apple-DTDĐ-IP15PM', 34990000, 33990000, '/uploads/products/product1-20250418095632309-8a946b.jpg', 'iPhone 15 Pro Max. Thiết kế titan...', 100, 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 4.9, 250, true, NOW(), NOW()),
('p2000000-0000-0000-0000-000000000002', 'S24U', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Samsung-DTDĐ-S24U', 33990000, 29990000, '/uploads/products/product-20250519151510514-07077d.jpg', 'Quyền năng Galaxy AI...', 80, 'c1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 4.8, 180, true, NOW(), NOW()),
('p3000000-0000-0000-0000-000000000003', 'MBP14M3', 'MacBook Pro 14 M3', 'macbook-pro-14-m3', 'Apple-Laptop-MBP14M3', 39990000, NULL, '/uploads/products/product1-20250418095632309-8a946b.jpg', 'MacBook Pro 14 inch với chip M3...', 40, 'c2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 5.0, 65, true, NOW(), NOW());

-- 8. Product Variants
INSERT INTO "ProductVariants" ("Id", "ProductId") VALUES
('v1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001'),
('v2000000-0000-0000-0000-000000000002', 'p2000000-0000-0000-0000-000000000002'),
('v3000000-0000-0000-0000-000000000003', 'p3000000-0000-0000-0000-000000000003');

INSERT INTO "ProductColor" ("Id", "ProductVariantsId", "Color") VALUES
(gen_random_uuid(), 'v1000000-0000-0000-0000-000000000001', 'Titan Đen'),
(gen_random_uuid(), 'v1000000-0000-0000-0000-000000000001', 'Titan Tự Nhiên'),
(gen_random_uuid(), 'v3000000-0000-0000-0000-000000000003', 'Bạc (Silver)');

INSERT INTO "ProductSize" ("Id", "ProductVariantsId", "Size") VALUES
(gen_random_uuid(), 'v1000000-0000-0000-0000-000000000001', '256GB'),
(gen_random_uuid(), 'v1000000-0000-0000-0000-000000000001', '512GB'),
(gen_random_uuid(), 'v3000000-0000-0000-0000-000000000003', '16GB/512GB');

-- 9. Product Specifications
INSERT INTO "ProductSpecifications" ("Id", "ProductId", "Name", "Value") VALUES
(gen_random_uuid(), 'p1000000-0000-0000-0000-000000000001', 'Màn hình', '6.7 inch OLED 120Hz'),
(gen_random_uuid(), 'p1000000-0000-0000-0000-000000000001', 'Camera sau', '48MP + 12MP + 12MP'),
(gen_random_uuid(), 'p2000000-0000-0000-0000-000000000002', 'Màn hình', '6.8 inch Dynamic AMOLED 2X'),
(gen_random_uuid(), 'p3000000-0000-0000-0000-000000000003', 'CPU', 'Apple M3');

-- 10. Banners
INSERT INTO "Banners" ("Id", "Title", "Description", "ImageUrl", "ButtonText", "ButtonLink", "CreatedAt", "UpdatedAt") VALUES
(gen_random_uuid(), 'Giảm 50% - Mùa hè rực rỡ', 'Ưu đãi đặc biệt cho tất cả sản phẩm thời trang mùa hè', '/uploads/banners/neutral-minimalist-summer-fashion-sale-banner-20250804151856963-cb21e9.png', 'Mua ngay', '/products?category=fashion&sale=summer', NOW(), NOW()),
(gen_random_uuid(), 'Điện tử giảm sốc', 'Giảm đến 30% cho các sản phẩm điện tử cao cấp', '/uploads/banners/gray-minimalist-fashion-big-sale-banner-20250804151827077-1f03c6.png', 'Khám phá', '/products?category=electronics&sale=true', NOW(), NOW()),
(gen_random_uuid(), 'Ưu đãi gia dụng', 'Mua 1 tặng 1 cho tất cả sản phẩm gia dụng', '/uploads/banners/brown-modern-fashion-(banner-(landscape))-20250804151909078-70d252.png', 'Xem ngay', '/products?category=home&promotion=buy1get1', NOW(), NOW());

-- 11. About
INSERT INTO "Abouts" ("Id", "CreatedAt", "UpdatedAt", "Hero_Title", "Hero_Description") VALUES
('a1000000-0000-0000-0000-000000000001', NOW(), NOW(), 'Câu Chuyện Của Chúng Tôi', 'Chúng tôi có sứ mệnh cung cấp các sản phẩm chất lượng cao nhằm nâng cao cuộc sống hàng ngày của bạn.');

-- Note: In EF Core, Owned types (ValueItem, TeamMember etc) might be mapped to separate tables or jsonb columns depending on config.
-- Using separate tables if configured:
-- INSERT INTO "ValueItem" ("Id", "AboutId", "Title", "Description") VALUES (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'Chất Lượng Là Hàng Đầu', 'Chúng tôi tin vào việc cung cấp các sản phẩm vượt trội về chất lượng và độ bền.');
