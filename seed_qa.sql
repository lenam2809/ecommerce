BEGIN;

INSERT INTO "Orders" (
    "Id", "Code", "ApplicationUserId", "TotalAmount", "Subtotal", "ShippingCost", "DiscountAmount",
    "OrderDate", "ShippingAddress", "Phone", "Email", "Status", "PaymentMethod", "PaymentStatus",
    "RecipientName", "DriverName", "DriverPhone", "DeliveryMethod", "DeliveryInstructions",
    "DeliveryType", "ShowroomId", "CreatedAt", "UpdatedAt", "IsDeleted", "ConcurrencyToken"
) VALUES (
    '11111111-2222-3333-4444-555555555555', 'ORD-2026-VIP001', '02a4d69f-734e-4f1a-acaa-de709c485577', 61990000.00, 61990000.00, 0, 0,
    NOW() - interval '2 days', '48 Tố Hữu, Nam Từ Liêm, Hà Nội', '0909 686 868', 'quan.nguyen@shopviet.vn',
    3, 'VNPay', 1,
    'Nguyễn Minh Quân', 'Nguyễn Văn Hưng', '0912345789', 'Giao siêu tốc 2H O2O', 'Giao trong giờ hành chính, gọi trước khi giao.',
    0, 'b704b599-a45b-4860-91be-fde8f8c5a830', NOW() - interval '2 days', NOW() - interval '2 days', false, E'\\x01020304'
) ON CONFLICT ("Id") DO NOTHING;

INSERT INTO "OrderItems" (
    "Id", "OrderId", "ProductId", "Quantity", "UnitPrice", "Name", "Image", "Color", "Size", "SkuCode", "VariantInfo", "AddOnName", "AddOnPrice", "WarrantyMonths", "DateAdded"
) VALUES (
    '22222222-3333-4444-5555-666666666666', '11111111-2222-3333-4444-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 61990000.00, 'MacBook Pro 14 M3 Pro (18GB/512GB)', '/placeholder.webp', 'Space Black', '14 inch (18GB/512GB)', 'MBP14-M3PRO-BLK', 'Space Black, 18GB/512GB', 'AppleCare+ 3 năm chính hãng Apple', 2490000.00, 24, NOW() - interval '2 days'
) ON CONFLICT ("Id") DO NOTHING;

INSERT INTO "OrderItemSerials" (
    "Id", "OrderItemId", "SerialNumber", "Imei", "WarrantyMonths", "WarrantyStatus", "WarrantyExpiresAt", "CreatedAt", "UpdatedAt", "IsDeleted", "ConcurrencyToken"
) VALUES (
    gen_random_uuid(), '22222222-3333-4444-5555-666666666666', 'VN2026-M3P8892', '358912345678901', 24, 'Active', NOW() + interval '2 years', NOW(), NOW(), false, E'\\x01020304'
);

INSERT INTO "ReturnRequests" (
    "Id", "Code", "OrderId", "OrderItemId", "CustomerId", "Type", "Reason", "Status",
    "CustomerNote", "StaffNote", "Quantity", "RefundAmount", "AssignedTechnicianName",
    "ProcessingMethod", "SerialNumber", "ShowroomId", "CreatedAt", "UpdatedAt", "IsDeleted", "ConcurrencyToken"
) VALUES (
    '33333333-4444-5555-6666-777777777777', 'RET-2026-001', '11111111-2222-3333-4444-555555555555', '22222222-3333-4444-5555-666666666666', '02a4d69f-734e-4f1a-acaa-de709c485577', 0, 0, 5,
    'Màn hình có vệt sọc xanh sau 2 ngày sử dụng', 'Đã tiếp nhận thiết bị, Serial trùng khớp hóa đơn',
    1, 61990000.00, 'Trần Quốc Bảo (Showroom Q.1)',
    'Đổi mới tại 45 Showroom trong 15 phút', 'VN2026-M3P8892', 'b704b599-a45b-4860-91be-fde8f8c5a830', NOW() - interval '1 day', NOW(), false, E'\\x01020304'
) ON CONFLICT ("Id") DO NOTHING;

INSERT INTO "ReturnRequestLogs" (
    "Id", "ReturnRequestId", "Step", "Action", "Title", "ActorName", "Location", "Note", "LoggedAt", "CreatedAt", "UpdatedAt", "IsDeleted", "ConcurrencyToken"
) VALUES 
(gen_random_uuid(), '33333333-4444-5555-6666-777777777777', 1, 'Initiate', 'Bước 1: Khởi tạo yêu cầu đổi/trả trực tuyến', 'Nguyễn Minh Quân', 'Ứng dụng Khách hàng', 'Khách hàng gửi yêu cầu 1 đổi 1 trong 30 ngày', NOW() - interval '24 hours', NOW(), NOW(), false, E'\\x01020304'),
(gen_random_uuid(), '33333333-4444-5555-6666-777777777777', 2, 'Receive', 'Bước 2: Tiếp nhận thiết bị & đối chiếu Serial/IMEI', 'Quầy CSKH Showroom', 'Showroom Nam Từ Liêm - 48 Tố Hữu', 'Tiếp nhận máy nguyên hộp, đối chiếu Serial VN2026-M3P8892 hợp lệ', NOW() - interval '18 hours', NOW(), NOW(), false, E'\\x01020304'),
(gen_random_uuid(), '33333333-4444-5555-6666-777777777777', 3, 'Inspect', 'Bước 3: KTV kiểm định phần cứng & chẩn đoán lỗi NSX', 'Trần Quốc Bảo (Showroom Q.1)', 'Khu Kỹ thuật Showroom', 'Xác nhận lỗi panel màn hình từ NSX, đủ điều kiện đổi mới 100% nguyên seal trong 15 phút', NOW() - interval '2 hours', NOW(), NOW(), false, E'\\x01020304');

COMMIT;
