using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTechEcommerceSpecsAndShowrooms2026 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ShowroomInventories",
                table: "ShowroomInventories");

            migrationBuilder.DropIndex(
                name: "IX_ShowroomInventories_ShowroomId_ProductId",
                table: "ShowroomInventories");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "ShowroomInventories");

            migrationBuilder.DropColumn(
                name: "ConcurrencyToken",
                table: "ShowroomInventories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ShowroomInventories");

            migrationBuilder.RenameColumn(
                name: "StockQuantity",
                table: "ShowroomInventories",
                newName: "Quantity");

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Showrooms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Step",
                table: "ReturnRequestLogs",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<bool>(
                name: "IsKeySpec",
                table: "ProductSpecifications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DeliveryType",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<decimal>(
                name: "DepositRequired",
                table: "Orders",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "DepositStatus",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PickupShowroomId",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShowroomInventories",
                table: "ShowroomInventories",
                columns: new[] { "ShowroomId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_Showrooms_Province",
                table: "Showrooms",
                column: "Province");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecifications_IsKeySpec",
                table: "ProductSpecifications",
                column: "IsKeySpec");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_DeliveryType",
                table: "Orders",
                column: "DeliveryType");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PickupShowroomId",
                table: "Orders",
                column: "PickupShowroomId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Showrooms_PickupShowroomId",
                table: "Orders",
                column: "PickupShowroomId",
                principalTable: "Showrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Showrooms_PickupShowroomId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Showrooms_Province",
                table: "Showrooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ShowroomInventories",
                table: "ShowroomInventories");

            migrationBuilder.DropIndex(
                name: "IX_ProductSpecifications_IsKeySpec",
                table: "ProductSpecifications");

            migrationBuilder.DropIndex(
                name: "IX_Orders_DeliveryType",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_PickupShowroomId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Showrooms");

            migrationBuilder.DropColumn(
                name: "Step",
                table: "ReturnRequestLogs");

            migrationBuilder.DropColumn(
                name: "IsKeySpec",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "DeliveryType",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DepositRequired",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DepositStatus",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupShowroomId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "ShowroomInventories",
                newName: "StockQuantity");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "ShowroomInventories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<byte[]>(
                name: "ConcurrencyToken",
                table: "ShowroomInventories",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ShowroomInventories",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShowroomInventories",
                table: "ShowroomInventories",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ShowroomInventories_ShowroomId_ProductId",
                table: "ShowroomInventories",
                columns: new[] { "ShowroomId", "ProductId" },
                unique: true);
        }
    }
}
