using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorCartItemSurrogateKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ProductVariantSkus_ProductVariantSkuId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Products_ProductId",
                table: "CartItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CartItems",
                table: "CartItems");

            if (migrationBuilder.ActiveProvider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            {
                migrationBuilder.Sql("UPDATE \"CartItems\" SET \"Color\" = '' WHERE \"Color\" IS NULL;");
                migrationBuilder.Sql("UPDATE \"CartItems\" SET \"Size\" = '' WHERE \"Size\" IS NULL;");
            }
            else if (migrationBuilder.ActiveProvider.Contains("SqlServer", StringComparison.OrdinalIgnoreCase))
            {
                migrationBuilder.Sql("UPDATE [CartItems] SET [Color] = '' WHERE [Color] IS NULL;");
                migrationBuilder.Sql("UPDATE [CartItems] SET [Size] = '' WHERE [Size] IS NULL;");
            }
            else
            {
                migrationBuilder.Sql("UPDATE CartItems SET Color = '' WHERE Color IS NULL;");
                migrationBuilder.Sql("UPDATE CartItems SET Size = '' WHERE Size IS NULL;");
            }

            migrationBuilder.AlterColumn<string>(
                name: "Size",
                table: "CartItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "CartItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            if (migrationBuilder.ActiveProvider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            {
                migrationBuilder.AddColumn<Guid>(
                    name: "Id",
                    table: "CartItems",
                    type: "uuid",
                    nullable: false,
                    defaultValueSql: "gen_random_uuid()");

                migrationBuilder.Sql("UPDATE \"CartItems\" SET \"Id\" = gen_random_uuid() WHERE \"Id\" = '00000000-0000-0000-0000-000000000000' OR \"Id\" IS NULL;");
            }
            else if (migrationBuilder.ActiveProvider.Contains("SqlServer", StringComparison.OrdinalIgnoreCase))
            {
                migrationBuilder.AddColumn<Guid>(
                    name: "Id",
                    table: "CartItems",
                    type: "uniqueidentifier",
                    nullable: false,
                    defaultValueSql: "NEWID()");

                migrationBuilder.Sql("UPDATE [CartItems] SET [Id] = NEWID() WHERE [Id] = '00000000-0000-0000-0000-000000000000' OR [Id] IS NULL;");
            }
            else
            {
                migrationBuilder.AddColumn<Guid>(
                    name: "Id",
                    table: "CartItems",
                    type: "TEXT",
                    nullable: false,
                    defaultValue: Guid.Empty);
            }

            migrationBuilder.AddPrimaryKey(
                name: "PK_CartItems",
                table: "CartItems",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductId_Color_Size",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId", "Color", "Size" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ProductVariantSkus_ProductVariantSkuId",
                table: "CartItems",
                column: "ProductVariantSkuId",
                principalTable: "ProductVariantSkus",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Products_ProductId",
                table: "CartItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ProductVariantSkus_ProductVariantSkuId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Products_ProductId",
                table: "CartItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CartItems",
                table: "CartItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductId_Color_Size",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "CartItems");

            migrationBuilder.AlterColumn<string>(
                name: "Size",
                table: "CartItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "CartItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "");

            migrationBuilder.Sql(@"
                WITH ranked AS (
                    SELECT ""Id"",
                           ROW_NUMBER() OVER(PARTITION BY ""CartId"", ""ProductId"" ORDER BY ""DateAdded"" DESC) as rn
                    FROM ""CartItems""
                )
                DELETE FROM ""CartItems"" ci
                USING ranked r
                WHERE ci.""Id"" = r.""Id"" AND r.rn > 1;
            ");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CartItems",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId" });

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ProductVariantSkus_ProductVariantSkuId",
                table: "CartItems",
                column: "ProductVariantSkuId",
                principalTable: "ProductVariantSkus",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Products_ProductId",
                table: "CartItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");
        }
    }
}
