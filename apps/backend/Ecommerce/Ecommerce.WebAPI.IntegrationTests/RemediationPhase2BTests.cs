using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Commands.AddToCart;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Application.Features.Returns.Commands.ApproveReturn;
using Ecommerce.Application.Features.Returns.Commands.UpdateReturnStatus;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class RemediationPhase2BTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();

    private HttpClient NewClient(bool handleCookies = false) =>
        _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = handleCookies
        });

    public void Dispose() => _factory.Dispose();

    // ─────────────────────────────────────────────────────────────
    // FLOW-01: Transaction Safety & Atomicity in CreateOrder
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FLOW01_CreateOrderSuccess_OrderItemsStockAndCartClearedAtomically()
    {
        Guid userId;
        Guid productId;
        Guid orderId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await db.Users.FirstAsync();
            userId = user.Id;

            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Flow01 Product", $"f01-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 500m, null, "products/test.png", "desc", 10,
                seed.CategoryId, seed.BrandId);
            db.Products.Add(product);

            var cart = new Cart(userId);
            cart.AddItem(product, 2);
            db.Carts.Add(cart);
            await db.SaveChangesAsync();

            productId = product.Id;
        }

        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var command = new CreateOrderCommand
            {
                ApplicationUserId = userId,
                ShippingAddress = "123 Test Street",
                Phone = "0912345678",
                Email = "test@example.com",
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = productId, Quantity = 2 }
                }
            };

            var result = await mediator.Send(command);
            Assert.True(result.IsSuccess, $"CreateOrder failed: {result.Error}");
            orderId = result.Value;
        }

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Order and order items exist
            var order = await db.Orders.Include(o => o.OrderItems).SingleOrDefaultAsync(o => o.Id == orderId);
            Assert.NotNull(order);
            Assert.Single(order.OrderItems);
            Assert.Equal(2, order.OrderItems.First().Quantity);

            // 2. Stock decremented atomically (10 -> 8)
            var product = await db.Products.AsNoTracking().SingleAsync(p => p.Id == productId);
            Assert.Equal(8, product.StockQuantity);

            // 3. User cart was cleared in the exact same transaction
            var cart = await db.Carts.Include(c => c.CartItems).SingleOrDefaultAsync(c => c.ApplicationUserId == userId);
            Assert.NotNull(cart);
            Assert.Empty(cart.CartItems);

            // 4. Outbox event recorded for OrderCreated
            var outboxMessages = await db.OutboxMessages.AsNoTracking()
                .Where(m => m.Type == typeof(OrderCreatedEvent).FullName)
                .ToListAsync();
            Assert.Contains(outboxMessages, m => m.Payload.Contains(orderId.ToString()));
        }
    }

    [Fact]
    public async Task FLOW01_InsufficientStock_RejectsOrderAndDoesNotDecrementStock()
    {
        Guid userId;
        Guid productId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await db.Users.FirstAsync();
            userId = user.Id;

            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Low Stock Prod", $"lsp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 500m, null, "products/test.png", "desc", 3,
                seed.CategoryId, seed.BrandId);
            db.Products.Add(product);
            await db.SaveChangesAsync();

            productId = product.Id;
        }

        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var command = new CreateOrderCommand
            {
                ApplicationUserId = userId,
                ShippingAddress = "123 Street",
                Phone = "0900000000",
                Email = "test@example.com",
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = productId, Quantity = 5 } // Request 5 when stock is 3
                }
            };

            var result = await mediator.Send(command);
            Assert.False(result.IsSuccess, "Order creation with insufficient stock must fail.");
        }

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var product = await db.Products.AsNoTracking().SingleAsync(p => p.Id == productId);
            Assert.Equal(3, product.StockQuantity); // Stock must remain untouched
        }
    }

    [Fact]
    public async Task FLOW01_ConcurrentOrders_DoesNotOversellAvailableStock()
    {
        Guid productId;
        Guid user1Id;
        Guid user2Id;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var users = await db.Users.Take(2).ToListAsync();
            user1Id = users[0].Id;
            user2Id = users[1].Id;

            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Limited Stock", $"ls-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 200m, null, "products/test.png", "desc", 5,
                seed.CategoryId, seed.BrandId);
            db.Products.Add(product);
            await db.SaveChangesAsync();

            productId = product.Id;
        }

        // Two concurrent orders attempting to purchase 4 items each (total 8 > 5 available)
        var task1 = Task.Run(async () =>
        {
            using var scope = _factory.CreateScope();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            return await mediator.Send(new CreateOrderCommand
            {
                ApplicationUserId = user1Id,
                ShippingAddress = "Street 1",
                Phone = "0911111111",
                Email = "u1@example.com",
                OrderItems = new List<CreateOrderItemDto> { new() { ProductId = productId, Quantity = 4 } }
            });
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = _factory.CreateScope();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            return await mediator.Send(new CreateOrderCommand
            {
                ApplicationUserId = user2Id,
                ShippingAddress = "Street 2",
                Phone = "0922222222",
                Email = "u2@example.com",
                OrderItems = new List<CreateOrderItemDto> { new() { ProductId = productId, Quantity = 4 } }
            });
        });

        var results = await Task.WhenAll(task1, task2);

        // At most one request can succeed
        var successCount = results.Count(r => r.IsSuccess);
        Assert.True(successCount <= 1, $"Expected at most 1 success, but got {successCount}");

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var product = await db.Products.AsNoTracking().SingleAsync(p => p.Id == productId);
            Assert.True(product.StockQuantity >= 0, $"Stock must never be negative. Actual: {product.StockQuantity}");
            Assert.Equal(5 - (successCount * 4), product.StockQuantity);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // DATA-01: CartItem Variant Support & Unique Constraints
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task DATA01_SameProductDifferentVariants_CreatesTwoSeparateCartLines()
    {
        using var client = NewClient();
        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var accessToken = (await login.Content.ReadFromJsonAsync<JsonObject>(JsonOptions))?["data"]?["accessToken"]?.GetValue<string>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        Guid productId;
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Shirt Product", $"shirt-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 300m, null, "products/test.png", "desc", 20,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            db.Products.Add(product);
            await db.SaveChangesAsync();
            productId = product.Id;
        }

        // Add first variant: Red / M
        var first = await client.PostAsJsonAsync("/api/cart/items",
            new { ProductId = productId, Quantity = 1, Color = "Red", Size = "M" }, JsonOptions);
        Assert.True(first.IsSuccessStatusCode, $"First add failed: {first.StatusCode}");

        // Add second variant: Blue / L (same product)
        var second = await client.PostAsJsonAsync("/api/cart/items",
            new { ProductId = productId, Quantity = 2, Color = "Blue", Size = "L" }, JsonOptions);
        Assert.True(second.IsSuccessStatusCode, $"Second add failed: {second.StatusCode}");

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var items = await db.Set<CartItem>().AsNoTracking()
                .Where(ci => ci.ProductId == productId)
                .OrderBy(ci => ci.Color)
                .ToListAsync();

            Assert.Equal(2, items.Count);
            Assert.Equal("Blue", items[0].Color);
            Assert.Equal("L", items[0].Size);
            Assert.Equal(2, items[0].Quantity);

            Assert.Equal("Red", items[1].Color);
            Assert.Equal("M", items[1].Size);
            Assert.Equal(1, items[1].Quantity);
        }
    }

    [Fact]
    public async Task DATA01_SameProductSameVariant_MergesQuantityInsteadOfDuplicate()
    {
        using var client = NewClient();
        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var accessToken = (await login.Content.ReadFromJsonAsync<JsonObject>(JsonOptions))?["data"]?["accessToken"]?.GetValue<string>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        Guid productId;
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Merge Product", $"mp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 300m, null, "products/test.png", "desc", 20,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            db.Products.Add(product);
            await db.SaveChangesAsync();
            productId = product.Id;
        }

        // Add Green / XL (qty 2)
        var first = await client.PostAsJsonAsync("/api/cart/items",
            new { ProductId = productId, Quantity = 2, Color = "Green", Size = "XL" }, JsonOptions);
        Assert.True(first.IsSuccessStatusCode, $"First add failed: {first.StatusCode}");

        // Add Green / XL again (qty 3)
        var second = await client.PostAsJsonAsync("/api/cart/items",
            new { ProductId = productId, Quantity = 3, Color = "Green", Size = "XL" }, JsonOptions);
        Assert.True(second.IsSuccessStatusCode, $"Second add failed: {second.StatusCode}");

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var items = await db.Set<CartItem>().AsNoTracking()
                .Where(ci => ci.ProductId == productId)
                .ToListAsync();

            Assert.Single(items);
            Assert.Equal("Green", items[0].Color);
            Assert.Equal("XL", items[0].Size);
            Assert.Equal(5, items[0].Quantity);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // FLOW-02: Order Cancellation Stock Restoration
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FLOW02_CancelOrderWithMultipleSkus_RestoresEachSkuCorrectly()
    {
        Guid orderId;
        Guid sku1Id;
        Guid sku2Id;
        byte[] token;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Multi SKU Prod", $"msp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku1 = ProductVariantSku.Create(product.Id, $"SKU1-{Guid.NewGuid():N}", 1000m, null, 10);
            sku1.Id = Guid.NewGuid();
            var sku2 = ProductVariantSku.Create(product.Id, $"SKU2-{Guid.NewGuid():N}", 1200m, null, 10);
            sku2.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku1.Id, sku1.Sku, "Red / M");
            order.AddOrderItem(product.Id, product.Name, product.Image, 1200m, 3, "Blue", "L", sku2.Id, sku2.Sku, "Blue / L");

            db.Products.Add(product);
            db.ProductVariantSkus.AddRange(sku1, sku2);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Simulate stock deduction: SKU1: 10 -> 8, SKU2: 10 -> 7
            await db.ProductVariantSkus.Where(s => s.Id == sku1.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 8));
            await db.ProductVariantSkus.Where(s => s.Id == sku2.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 7));

            orderId = order.Id;
            sku1Id = sku1.Id;
            sku2Id = sku2.Id;
            token = (await db.Orders.AsNoTracking().SingleAsync(o => o.Id == order.Id)).ConcurrencyToken;
        }

        // Cancel the order
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new UpdateOrderStatusCommand
            {
                Id = orderId,
                Status = EOrderStatus.Cancelled,
                RowVersion = Convert.ToBase64String(token)
            });
            Assert.True(result.IsSuccess, $"Cancellation failed: {result.Error}");
        }

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var s1 = await db.ProductVariantSkus.AsNoTracking().SingleAsync(s => s.Id == sku1Id);
            var s2 = await db.ProductVariantSkus.AsNoTracking().SingleAsync(s => s.Id == sku2Id);

            // SKU1 restored by 2 (8 + 2 = 10), SKU2 restored by 3 (7 + 3 = 10)
            Assert.Equal(10, s1.StockQuantity);
            Assert.Equal(10, s2.StockQuantity);
        }
    }

    [Fact]
    public async Task FLOW02_CancelOrderWithoutSku_RestoresProductStock()
    {
        Guid orderId;
        Guid productId;
        byte[] token;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Non Variant Prod", $"nvp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 500m, null, "products/test.png", "desc", 15,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 500m, 4, null, null, null, null, null);

            db.Products.Add(product);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Simulate stock deduction: 15 -> 11
            await db.Products.Where(p => p.Id == product.Id).ExecuteUpdateAsync(p => p.SetProperty(x => x.StockQuantity, 11));

            orderId = order.Id;
            productId = product.Id;
            token = (await db.Orders.AsNoTracking().SingleAsync(o => o.Id == order.Id)).ConcurrencyToken;
        }

        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new UpdateOrderStatusCommand
            {
                Id = orderId,
                Status = EOrderStatus.Cancelled,
                RowVersion = Convert.ToBase64String(token)
            });
            Assert.True(result.IsSuccess, $"Cancellation failed: {result.Error}");
        }

        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var product = await db.Products.AsNoTracking().SingleAsync(p => p.Id == productId);
            // Product stock restored by 4 (11 + 4 = 15)
            Assert.Equal(15, product.StockQuantity);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // FLOW-03: RMA Stock Restoration
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FLOW03_RmaApproval_DoesNotRestoreStockUntilInspectionCompleted()
    {
        Guid rmaId;
        Guid skuId;
        Guid adminId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            adminId = admin.Id;

            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "RMA Prod", $"rma-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 800m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 800m, null, 2);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "c@example.com", "0900000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 800m, 1, "Red", "M", sku.Id, sku.Sku, "Red / M");
            var orderItem = order.OrderItems.First();

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var rma = ReturnRequest.Create(
                order.Id, orderItem.Id, admin.Id, EReturnType.Return, EReturnReason.Defective,
                "Defective item", 1, 800m);
            db.ReturnRequests.Add(rma);
            await db.SaveChangesAsync();

            rmaId = rma.Id;
            skuId = sku.Id;
        }

        // Move to UnderReview and Approve
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.UnderReview });
            await mediator.Send(new ApproveReturnCommand { ReturnRequestId = rmaId, StaffId = adminId, FinalRefundAmount = 800m });
        }

        // Verify stock is STILL 2 (approval does NOT restore stock)
        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var sku = await db.ProductVariantSkus.AsNoTracking().SingleAsync(s => s.Id == skuId);
            Assert.Equal(2, sku.StockQuantity);
        }

        // Move through ItemReceived -> QualityCheck -> RefundProcessing -> Completed
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.ItemReceived });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.QualityCheck });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.RefundProcessing });
            var completeResult = await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.Completed });
            Assert.True(completeResult.IsSuccess);
        }

        // Verify stock is NOW 3 (2 + 1 returned after passing inspection)
        using (var verify = _factory.CreateScope())
        {
            var db = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var sku = await db.ProductVariantSkus.AsNoTracking().SingleAsync(s => s.Id == skuId);
            Assert.Equal(3, sku.StockQuantity);
        }
    }
}
