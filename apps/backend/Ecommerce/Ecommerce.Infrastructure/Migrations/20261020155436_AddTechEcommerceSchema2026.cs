using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTechEcommerceSchema2026 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReturnRequests_Orders_OrderId",
                table: "ReturnRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProductSpecifications_ProductId",
                table: "ProductSpecifications");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductId_Color_Size",
                table: "CartItems");

            migrationBuilder.AddColumn<string>(
                name: "AssignedTechnicianName",
                table: "ReturnRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcessingMethod",
                table: "ReturnRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "ReturnRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ShowroomId",
                table: "ReturnRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "ProductSpecifications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FilterKey",
                table: "ProductSpecifications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroupName",
                table: "ProductSpecifications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "Chung");

            migrationBuilder.AddColumn<bool>(
                name: "IsHighlight",
                table: "ProductSpecifications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OriginBadge",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyMonths",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 24);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyPolicy",
                table: "Products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarrierName",
                table: "Orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyAddress",
                table: "Orders",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Orders",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryMethod",
                table: "Orders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "StandardDelivery");

            migrationBuilder.AddColumn<decimal>(
                name: "DepositAmount",
                table: "Orders",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Orders",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DriverName",
                table: "Orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverPhone",
                table: "Orders",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceEmail",
                table: "Orders",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceFileUrl",
                table: "Orders",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Orders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "COD");

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "Orders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Pending");

            migrationBuilder.AddColumn<string>(
                name: "RecipientName",
                table: "Orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RemainingAmount",
                table: "Orders",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "RequireInvoice",
                table: "Orders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingCost",
                table: "Orders",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "ShowroomId",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Orders",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "TaxCode",
                table: "Orders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrackingNumber",
                table: "Orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionId",
                table: "Orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AddOnId",
                table: "OrderItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddOnName",
                table: "OrderItems",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AddOnPrice",
                table: "OrderItems",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyMonths",
                table: "OrderItems",
                type: "integer",
                nullable: false,
                defaultValue: 24);

            migrationBuilder.AddColumn<string>(
                name: "Imei",
                table: "InventoryItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WarrantyExpiresAt",
                table: "InventoryItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyMonths",
                table: "InventoryItems",
                type: "integer",
                nullable: false,
                defaultValue: 24);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDefault",
                table: "CustomerAddresses",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<string>(
                name: "AddressType",
                table: "CustomerAddresses",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Home",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "ReceiverName",
                table: "CustomerAddresses",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReceiverPhone",
                table: "CustomerAddresses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "AddOnId",
                table: "CartItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AddOnPrice",
                table: "CartItems",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "FlashSales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Subtitle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    BannerImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StartTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlashSales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyPointTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    TransactionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyPointTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyPointTransactions_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoyaltyPointTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItemSerials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    InventoryItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Imei = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    WarrantyMonths = table.Column<int>(type: "integer", nullable: false, defaultValue: 24),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    WarrantyExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    WarrantyStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItemSerials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItemSerials_InventoryItems_InventoryItemId",
                        column: x => x.InventoryItemId,
                        principalTable: "InventoryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OrderItemSerials_OrderItems_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "OrderItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductAddOns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: true),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AddOnType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    DurationMonths = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAddOns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAddOns_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductAddOns_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductAddOns_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ReturnRequestLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReturnRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ActorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProcessingMethod = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LoggedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReturnRequestLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReturnRequestLogs_ReturnRequests_ReturnRequestId",
                        column: x => x.ReturnRequestId,
                        principalTable: "ReturnRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Showrooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Region = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "HCM"),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Ward = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "1800 6868"),
                    OpeningHours = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "08:00 - 21:30"),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    GoogleMapIframeUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsFlagship = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    HasInstantPickup = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Showrooms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DiscountType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "FixedAmount"),
                    DiscountValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MinOrderValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MaxDiscountAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UsageLimit = table.Column<int>(type: "integer", nullable: false),
                    UsedCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vouchers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FlashSaleItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlashSaleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductVariantSkuId = table.Column<Guid>(type: "uuid", nullable: true),
                    FlashSalePrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TotalQuota = table.Column<int>(type: "integer", nullable: false),
                    SoldCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    MaxPerCustomer = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    IsHeroFeatured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BadgeText = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlashSaleItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FlashSaleItems_FlashSales_FlashSaleId",
                        column: x => x.FlashSaleId,
                        principalTable: "FlashSales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FlashSaleItems_ProductVariantSkus_ProductVariantSkuId",
                        column: x => x.ProductVariantSkuId,
                        principalTable: "ProductVariantSkus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FlashSaleItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShowroomInventories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ShowroomId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductVariantSkuId = table.Column<Guid>(type: "uuid", nullable: true),
                    StockQuantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ReservedQuantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsAvailableFor2hDelivery = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShowroomInventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShowroomInventories_ProductVariantSkus_ProductVariantSkuId",
                        column: x => x.ProductVariantSkuId,
                        principalTable: "ProductVariantSkus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShowroomInventories_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShowroomInventories_Showrooms_ShowroomId",
                        column: x => x.ShowroomId,
                        principalTable: "Showrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReturnRequests_SerialNumber",
                table: "ReturnRequests",
                column: "SerialNumber");

            migrationBuilder.CreateIndex(
                name: "IX_ReturnRequests_ShowroomId",
                table: "ReturnRequests",
                column: "ShowroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecifications_FilterKey",
                table: "ProductSpecifications",
                column: "FilterKey");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecifications_ProductId_GroupName",
                table: "ProductSpecifications",
                columns: new[] { "ProductId", "GroupName" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ShowroomId",
                table: "Orders",
                column: "ShowroomId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_AddOnId",
                table: "OrderItems",
                column: "AddOnId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_Imei",
                table: "InventoryItems",
                column: "Imei");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_AddOnId",
                table: "CartItems",
                column: "AddOnId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductId_Color_Size",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId", "Color", "Size" });

            migrationBuilder.CreateIndex(
                name: "IX_FlashSaleItems_FlashSaleId_ProductId",
                table: "FlashSaleItems",
                columns: new[] { "FlashSaleId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_FlashSaleItems_IsHeroFeatured",
                table: "FlashSaleItems",
                column: "IsHeroFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_FlashSaleItems_ProductId",
                table: "FlashSaleItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_FlashSaleItems_ProductVariantSkuId",
                table: "FlashSaleItems",
                column: "ProductVariantSkuId");

            migrationBuilder.CreateIndex(
                name: "IX_FlashSales_Code",
                table: "FlashSales",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlashSales_IsActive_StartTime_EndTime",
                table: "FlashSales",
                columns: new[] { "IsActive", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPointTransactions_CreatedAt",
                table: "LoyaltyPointTransactions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPointTransactions_OrderId",
                table: "LoyaltyPointTransactions",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPointTransactions_UserId",
                table: "LoyaltyPointTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemSerials_Imei",
                table: "OrderItemSerials",
                column: "Imei");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemSerials_InventoryItemId",
                table: "OrderItemSerials",
                column: "InventoryItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemSerials_OrderItemId",
                table: "OrderItemSerials",
                column: "OrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemSerials_SerialNumber",
                table: "OrderItemSerials",
                column: "SerialNumber");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAddOns_BrandId",
                table: "ProductAddOns",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAddOns_CategoryId",
                table: "ProductAddOns",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAddOns_Code",
                table: "ProductAddOns",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAddOns_ProductId",
                table: "ProductAddOns",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ReturnRequestLogs_LoggedAt",
                table: "ReturnRequestLogs",
                column: "LoggedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ReturnRequestLogs_ReturnRequestId",
                table: "ReturnRequestLogs",
                column: "ReturnRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ShowroomInventories_ProductId",
                table: "ShowroomInventories",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ShowroomInventories_ProductVariantSkuId",
                table: "ShowroomInventories",
                column: "ProductVariantSkuId");

            migrationBuilder.CreateIndex(
                name: "IX_ShowroomInventories_ShowroomId_ProductId",
                table: "ShowroomInventories",
                columns: new[] { "ShowroomId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Showrooms_Code",
                table: "Showrooms",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Showrooms_Region",
                table: "Showrooms",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_Code",
                table: "Vouchers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_IsActive",
                table: "Vouchers",
                column: "IsActive");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ProductAddOns_AddOnId",
                table: "CartItems",
                column: "AddOnId",
                principalTable: "ProductAddOns",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_ProductAddOns_AddOnId",
                table: "OrderItems",
                column: "AddOnId",
                principalTable: "ProductAddOns",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Showrooms_ShowroomId",
                table: "Orders",
                column: "ShowroomId",
                principalTable: "Showrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnRequests_Orders_OrderId",
                table: "ReturnRequests",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnRequests_Showrooms_ShowroomId",
                table: "ReturnRequests",
                column: "ShowroomId",
                principalTable: "Showrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ProductAddOns_AddOnId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_ProductAddOns_AddOnId",
                table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Showrooms_ShowroomId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_ReturnRequests_Orders_OrderId",
                table: "ReturnRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ReturnRequests_Showrooms_ShowroomId",
                table: "ReturnRequests");

            migrationBuilder.DropTable(
                name: "FlashSaleItems");

            migrationBuilder.DropTable(
                name: "LoyaltyPointTransactions");

            migrationBuilder.DropTable(
                name: "OrderItemSerials");

            migrationBuilder.DropTable(
                name: "ProductAddOns");

            migrationBuilder.DropTable(
                name: "ReturnRequestLogs");

            migrationBuilder.DropTable(
                name: "ShowroomInventories");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "FlashSales");

            migrationBuilder.DropTable(
                name: "Showrooms");

            migrationBuilder.DropIndex(
                name: "IX_ReturnRequests_SerialNumber",
                table: "ReturnRequests");

            migrationBuilder.DropIndex(
                name: "IX_ReturnRequests_ShowroomId",
                table: "ReturnRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProductSpecifications_FilterKey",
                table: "ProductSpecifications");

            migrationBuilder.DropIndex(
                name: "IX_ProductSpecifications_ProductId_GroupName",
                table: "ProductSpecifications");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ShowroomId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_AddOnId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_InventoryItems_Imei",
                table: "InventoryItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_AddOnId",
                table: "CartItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductId_Color_Size",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "AssignedTechnicianName",
                table: "ReturnRequests");

            migrationBuilder.DropColumn(
                name: "ProcessingMethod",
                table: "ReturnRequests");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "ReturnRequests");

            migrationBuilder.DropColumn(
                name: "ShowroomId",
                table: "ReturnRequests");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "FilterKey",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "GroupName",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "IsHighlight",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "OriginBadge",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WarrantyMonths",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WarrantyPolicy",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CarrierName",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CompanyAddress",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryMethod",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DepositAmount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DriverName",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DriverPhone",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "InvoiceEmail",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "InvoiceFileUrl",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RecipientName",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RemainingAmount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RequireInvoice",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShippingCost",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShowroomId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TaxCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TrackingNumber",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AddOnId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "AddOnName",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "AddOnPrice",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "WarrantyMonths",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "Imei",
                table: "InventoryItems");

            migrationBuilder.DropColumn(
                name: "WarrantyExpiresAt",
                table: "InventoryItems");

            migrationBuilder.DropColumn(
                name: "WarrantyMonths",
                table: "InventoryItems");

            migrationBuilder.DropColumn(
                name: "ReceiverName",
                table: "CustomerAddresses");

            migrationBuilder.DropColumn(
                name: "ReceiverPhone",
                table: "CustomerAddresses");

            migrationBuilder.DropColumn(
                name: "AddOnId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "AddOnPrice",
                table: "CartItems");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDefault",
                table: "CustomerAddresses",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "AddressType",
                table: "CustomerAddresses",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "Home");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecifications_ProductId",
                table: "ProductSpecifications",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductId_Color_Size",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId", "Color", "Size" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnRequests_Orders_OrderId",
                table: "ReturnRequests",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
        }
    }
}
