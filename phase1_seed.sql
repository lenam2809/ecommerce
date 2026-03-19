SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

DECLARE @ProductId UNIQUEIDENTIFIER = '1996CD88-0875-419F-4410-08DE4EC0CAF6';
DECLARE @OrderId UNIQUEIDENTIFIER = 'DBF4BE57-ACB2-44EB-9BF1-0D74E81B8677';
DECLARE @OrderItemId UNIQUEIDENTIFIER = 'A90C3EC7-F616-42C1-AD2A-A0695B7F66C6';
DECLARE @CustomerId UNIQUEIDENTIFIER = '72D0B009-CF60-4137-FABC-08DE4EC0CAB3';

-- SKUs
DECLARE @SkuWLId UNIQUEIDENTIFIER = NEWID();
DECLARE @SkuBUId UNIQUEIDENTIFIER = NEWID();
DECLARE @SkuWUId UNIQUEIDENTIFIER = NEWID();

INSERT INTO ProductVariantSkus (Id, ProductId, Sku, Price, SalePrice, StockQuantity, IsActive, CreatedAt, IsDeleted)
VALUES
    (@SkuWLId, @ProductId, 'APP2-WH-LT', 5590000, 5290000, 50, 1, GETUTCDATE(), 0),
    (@SkuBUId, @ProductId, 'APP2-BK-UC', 6290000, 5990000, 30, 1, GETUTCDATE(), 0),
    (@SkuWUId, @ProductId, 'APP2-WH-UC', 6290000, NULL, 20, 1, GETUTCDATE(), 0);

PRINT 'Inserted 3 ProductVariantSkus';

-- SkuAttributeValues
DECLARE @VWh UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ProductAttributeValues WHERE Value = N'Trang');
DECLARE @VBk UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ProductAttributeValues WHERE Value = N'Den');
DECLARE @VLt UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ProductAttributeValues WHERE Value = N'Lightning');
DECLARE @VUc UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM ProductAttributeValues WHERE Value = N'USB-C');

INSERT INTO SkuAttributeValues (Id, ProductVariantSkuId, ProductAttributeValueId)
VALUES
    (NEWID(), @SkuWLId, @VWh),
    (NEWID(), @SkuWLId, @VLt),
    (NEWID(), @SkuBUId, @VBk),
    (NEWID(), @SkuBUId, @VUc),
    (NEWID(), @SkuWUId, @VWh),
    (NEWID(), @SkuWUId, @VUc);

PRINT 'Inserted 6 SkuAttributeValues';

-- InventoryItems (IMEI/Serial)
INSERT INTO InventoryItems (Id, ProductVariantSkuId, SerialNumber, Status, ImportedAt, BatchCode, CreatedAt, IsDeleted)
VALUES
    (NEWID(), @SkuWLId, 'IMEI-APP2-WH-LT-001', 0, GETUTCDATE(), 'BATCH-2026-03', GETUTCDATE(), 0),
    (NEWID(), @SkuWLId, 'IMEI-APP2-WH-LT-002', 0, GETUTCDATE(), 'BATCH-2026-03', GETUTCDATE(), 0),
    (NEWID(), @SkuWLId, 'IMEI-APP2-WH-LT-003', 2, GETUTCDATE(), 'BATCH-2026-03', GETUTCDATE(), 0),
    (NEWID(), @SkuBUId, 'IMEI-APP2-BK-UC-001', 0, GETUTCDATE(), 'BATCH-2026-03', GETUTCDATE(), 0),
    (NEWID(), @SkuBUId, 'IMEI-APP2-BK-UC-002', 1, GETUTCDATE(), 'BATCH-2026-03', GETUTCDATE(), 0),
    (NEWID(), @SkuWUId, 'IMEI-APP2-WH-UC-001', 0, GETUTCDATE(), 'BATCH-2026-03', GETUTCDATE(), 0);

PRINT 'Inserted 6 InventoryItems';

-- Update Order to Delivered (Status = 6)
UPDATE Orders SET Status = 6, UpdatedAt = DATEADD(DAY, -2, GETUTCDATE()) WHERE Id = @OrderId;
PRINT 'Updated Order to Delivered status';

-- ReturnRequest
DECLARE @ReturnId UNIQUEIDENTIFIER = NEWID();

INSERT INTO ReturnRequests (Id, Code, OrderId, OrderItemId, CustomerId, [Type], Reason, Status, CustomerNote, Quantity, RefundAmount, CreatedAt, IsDeleted)
VALUES (
    @ReturnId,
    'RMA-2026030001',
    @OrderId,
    @OrderItemId,
    @CustomerId,
    0, 0, 0,
    N'San pham bi loi am thanh o tai nghe ben trai, muon tra hang va hoan tien.',
    1, 5590000,
    GETUTCDATE(), 0
);

PRINT 'Inserted ReturnRequest';

-- ReturnStatusHistory
INSERT INTO ReturnStatusHistories (Id, ReturnRequestId, Status, Note, ChangedAt, CreatedAt, IsDeleted)
VALUES (NEWID(), @ReturnId, 0, N'Khach hang gui yeu cau doi/tra hang', GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Inserted ReturnStatusHistory';

-- Verify counts
SELECT 'ProductAttributes' AS [Table], COUNT(*) AS [Count] FROM ProductAttributes
UNION ALL SELECT 'ProductAttributeValues', COUNT(*) FROM ProductAttributeValues
UNION ALL SELECT 'ProductVariantSkus', COUNT(*) FROM ProductVariantSkus
UNION ALL SELECT 'SkuAttributeValues', COUNT(*) FROM SkuAttributeValues
UNION ALL SELECT 'InventoryItems', COUNT(*) FROM InventoryItems
UNION ALL SELECT 'ReturnRequests', COUNT(*) FROM ReturnRequests
UNION ALL SELECT 'ReturnStatusHistories', COUNT(*) FROM ReturnStatusHistories;
GO
