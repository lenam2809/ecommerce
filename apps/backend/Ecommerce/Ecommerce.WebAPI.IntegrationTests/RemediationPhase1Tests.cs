using System.Text.Json;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.DeleteOrder;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus;
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

public sealed class RemediationPhase1Tests : IDisposable
{
    private readonly CustomWebApplicationFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    // ─────────────────────────────────────────────────────────────
    // FLOW-02: Order Cancellation & Deletion Stock Restoration
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FLOW02_CancellingOrderTwice_DoesNotDoubleRestoreStock()
    {
        Guid orderId;
        Guid skuId;
        Guid productId;
        byte[] token;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Variant Product", $"vp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Simulate stock deduction at checkout: SKU stock 5 -> 3
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            orderId = order.Id;
            skuId = sku.Id;
            productId = product.Id;
            token = (await db.Orders.AsNoTracking().SingleAsync(o => o.Id == order.Id)).ConcurrencyToken;
        }

        // First cancellation -> should succeed and restore stock to 5
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new UpdateOrderStatusCommand
            {
                Id = orderId,
                Status = EOrderStatus.Cancelled,
                RowVersion = Convert.ToBase64String(token)
            });
            Assert.True(result.IsSuccess, $"First cancel failed: {result.Error}");
        }

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var skuStockAfterFirst = await db.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            var productStockAfterFirst = await db.Products.AsNoTracking()
                .Where(p => p.Id == productId).Select(p => p.StockQuantity).SingleAsync();

            Assert.Equal(5, skuStockAfterFirst);
            Assert.Equal(0, productStockAfterFirst);

            token = (await db.Orders.AsNoTracking().SingleAsync(o => o.Id == orderId)).ConcurrencyToken;
        }

        // Second cancellation attempt -> must be rejected (Cancelled -> Cancelled is invalid)
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new UpdateOrderStatusCommand
            {
                Id = orderId,
                Status = EOrderStatus.Cancelled,
                RowVersion = Convert.ToBase64String(token)
            });
            Assert.False(result.IsSuccess, "Second cancel of already cancelled order must be rejected.");
        }

        // Direct event dispatch simulation (e.g. duplicate queue delivery) -> must be idempotent
        using (var scope = _factory.CreateScope())
        {
            var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();
            await publisher.Publish(new OrderStatusChangedEvent(
                orderId, "CODE", null, EOrderStatus.Pending, EOrderStatus.Cancelled, "cust@example.com", "Customer"));
        }

        // Verify stock is STILL 5 and Product.StockQuantity is STILL 0 (never double-restored)
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var finalSkuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            var finalProductStock = await verifyDb.Products.AsNoTracking()
                .Where(p => p.Id == productId).Select(p => p.StockQuantity).SingleAsync();

            Assert.Equal(5, finalSkuStock);
            Assert.Equal(0, finalProductStock);
        }
    }

    [Fact]
    public async Task FLOW02_CancellingShippedOrder_IsRejectedAndDoesNotRestoreStock()
    {
        Guid orderId;
        Guid skuId;
        byte[] token;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Variant Product", $"vp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");
            order.UpdateStatus(EOrderStatus.Processing);
            order.UpdateStatus(EOrderStatus.Shipped);

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // SKU stock after checkout = 3
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            orderId = order.Id;
            skuId = sku.Id;
            token = (await db.Orders.AsNoTracking().SingleAsync(o => o.Id == order.Id)).ConcurrencyToken;
        }

        // Attempt to cancel Shipped order -> must fail
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new UpdateOrderStatusCommand
            {
                Id = orderId,
                Status = EOrderStatus.Cancelled,
                RowVersion = Convert.ToBase64String(token)
            });
            Assert.False(result.IsSuccess, "Cancelling a shipped order must be rejected.");
        }

        // Verify SKU stock remains 3
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var currentSkuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            Assert.Equal(3, currentSkuStock);
        }
    }

    [Fact]
    public async Task FLOW02_DeletingPendingOrderWithVariantSku_RestoresSkuStock()
    {
        Guid orderId;
        Guid skuId;
        Guid productId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Variant Product", $"vp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Deduct stock to 3
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            orderId = order.Id;
            skuId = sku.Id;
            productId = product.Id;
        }

        // Delete pending order
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new DeleteOrderCommand { Id = orderId });
            Assert.True(result.IsSuccess, $"Delete failed: {result.Error}");
        }

        // Verify SKU stock is restored to 5 and Product stock is 0
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var skuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            var productStock = await verifyDb.Products.AsNoTracking()
                .Where(p => p.Id == productId).Select(p => p.StockQuantity).SingleAsync();

            Assert.Equal(5, skuStock);
            Assert.Equal(0, productStock);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // FLOW-03: Return Request (RMA) Stock Restoration
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FLOW03_RmaApproved_DoesNotRestoreStockEarly()
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
                $"P-{Guid.NewGuid():N}"[..20], "RMA Product", $"rma-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");
            order.UpdateStatus(EOrderStatus.Processing);
            order.UpdateStatus(EOrderStatus.Shipped);
            order.UpdateStatus(EOrderStatus.Delivered);

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Stock decremented to 3 at checkout
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            skuId = sku.Id;
            var orderItem = order.OrderItems.First();

            var rma = ReturnRequest.Create(
                order.Id, orderItem.Id, admin.Id, EReturnType.Return, EReturnReason.Defective,
                "Defective item", 1, 1000m);
            db.ReturnRequests.Add(rma);
            await db.SaveChangesAsync();

            rmaId = rma.Id;
        }

        // Staff moves RMA: UnderReview -> Approved
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            var reviewResult = await mediator.Send(new UpdateReturnStatusCommand
            {
                ReturnRequestId = rmaId,
                NewStatus = EReturnStatus.UnderReview,
                Note = "Staff reviewing"
            });
            Assert.True(reviewResult.IsSuccess, $"Review failed: {reviewResult.Error}");

            var approveResult = await mediator.Send(new ApproveReturnCommand
            {
                ReturnRequestId = rmaId,
                StaffId = adminId,
                StaffNote = "Approved return",
                FinalRefundAmount = 1000m
            });
            Assert.True(approveResult.IsSuccess, $"Approve failed: {approveResult.Error}");
        }

        // Verify stock is STILL 3 (Approved must NOT restore stock early)
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var currentSkuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            var rma = await verifyDb.ReturnRequests.AsNoTracking().SingleAsync(r => r.Id == rmaId);

            Assert.Equal(3, currentSkuStock);
            Assert.Equal(EReturnStatus.Approved, rma.Status);
        }
    }

    [Fact]
    public async Task FLOW03_RmaCompleted_RestoresStockAndIsIdempotent()
    {
        Guid rmaId;
        Guid skuId;
        Guid productId;
        Guid adminId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            adminId = admin.Id;
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "RMA Product", $"rma-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");
            order.UpdateStatus(EOrderStatus.Processing);
            order.UpdateStatus(EOrderStatus.Shipped);
            order.UpdateStatus(EOrderStatus.Delivered);

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Stock decremented to 3 at checkout
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            skuId = sku.Id;
            productId = product.Id;
            var orderItem = order.OrderItems.First();

            var rma = ReturnRequest.Create(
                order.Id, orderItem.Id, admin.Id, EReturnType.Return, EReturnReason.Defective,
                "Defective item", 1, 1000m);
            db.ReturnRequests.Add(rma);
            await db.SaveChangesAsync();

            rmaId = rma.Id;
        }

        // Full RMA lifecycle through QualityCheck:
        // UnderReview -> Approved -> ItemReceived -> QualityCheck -> RefundProcessing -> Completed
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.UnderReview });
            await mediator.Send(new ApproveReturnCommand { ReturnRequestId = rmaId, StaffId = adminId, FinalRefundAmount = 1000m });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.ItemReceived });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.QualityCheck });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.RefundProcessing });
            var completeResult = await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.Completed });

            Assert.True(completeResult.IsSuccess, $"Complete failed: {completeResult.Error}");
        }

        // Verify SKU stock is now 4 (3 + 1 returned) and Product stock is 0
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var skuStockAfterComplete = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            var productStockAfterComplete = await verifyDb.Products.AsNoTracking()
                .Where(p => p.Id == productId).Select(p => p.StockQuantity).SingleAsync();

            Assert.Equal(4, skuStockAfterComplete);
            Assert.Equal(0, productStockAfterComplete);
        }

        // Attempt to complete a second time -> should be rejected by status transition validator
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var secondComplete = await mediator.Send(new UpdateReturnStatusCommand
            {
                ReturnRequestId = rmaId,
                NewStatus = EReturnStatus.Completed
            });
            Assert.False(secondComplete.IsSuccess, "Completing an already completed RMA must be rejected.");
        }

        // Simulate re-dispatching ReturnRequestCompletedEvent directly -> must be idempotent
        using (var scope = _factory.CreateScope())
        {
            var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();
            await publisher.Publish(new ReturnRequestCompletedEvent(
                rmaId, "RMA-CODE", Guid.NewGuid(), EReturnType.Return, 1000m));
        }

        // Verify stock is STILL 4 (never double-restored)
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var finalSkuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            Assert.Equal(4, finalSkuStock);
        }
    }

    [Fact]
    public async Task FLOW03_RmaCompleted_RestoresStockForNonVariantProduct()
    {
        Guid rmaId;
        Guid productId;
        Guid adminId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            adminId = admin.Id;
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Non-Variant Product", $"nv-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 5,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, null, null);
            order.UpdateStatus(EOrderStatus.Processing);
            order.UpdateStatus(EOrderStatus.Shipped);
            order.UpdateStatus(EOrderStatus.Delivered);

            db.Products.Add(product);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Simulate stock deduction at checkout: Product stock 5 -> 3
            await db.Products.Where(p => p.Id == product.Id)
                .ExecuteUpdateAsync(p => p.SetProperty(x => x.StockQuantity, 3));

            productId = product.Id;
            var orderItem = order.OrderItems.First();

            var rma = ReturnRequest.Create(
                order.Id, orderItem.Id, admin.Id, EReturnType.Return, EReturnReason.Defective,
                "Defective item", 1, 1000m);
            db.ReturnRequests.Add(rma);
            await db.SaveChangesAsync();

            rmaId = rma.Id;
        }

        // Complete RMA through QualityCheck:
        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.UnderReview });
            await mediator.Send(new ApproveReturnCommand { ReturnRequestId = rmaId, StaffId = adminId, FinalRefundAmount = 1000m });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.ItemReceived });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.QualityCheck });
            await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.RefundProcessing });
            var completeResult = await mediator.Send(new UpdateReturnStatusCommand { ReturnRequestId = rmaId, NewStatus = EReturnStatus.Completed });

            Assert.True(completeResult.IsSuccess, $"Complete failed: {completeResult.Error}");
        }

        // Verify Product stock is restored from 3 to 4
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var productStock = await verifyDb.Products.AsNoTracking()
                .Where(p => p.Id == productId).Select(p => p.StockQuantity).SingleAsync();
            Assert.Equal(4, productStock);
        }
    }
    [Fact]
    public async Task FLOW02_CancellingOrderWithMixedItems_RestoresEachStockCorrectly()
    {
        Guid orderId;
        Guid skuId;
        Guid variantProductId;
        Guid nonVariantProductId;
        byte[] token;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var variantProduct = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Variant Product", $"vp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            variantProduct.Id = Guid.NewGuid();
            variantProduct.EnableVariants();

            var sku = ProductVariantSku.Create(variantProduct.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var nonVariantProduct = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Non-Variant Product", $"nvp-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 500m, null, "products/nv.png", "desc", 10,
                seed.CategoryId, seed.BrandId);
            nonVariantProduct.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(variantProduct.Id, variantProduct.Name, variantProduct.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");
            order.AddOrderItem(nonVariantProduct.Id, nonVariantProduct.Name, nonVariantProduct.Image, 500m, 3, null, null);

            db.Products.AddRange(variantProduct, nonVariantProduct);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Simulate stock deduction at checkout:
            // SKU stock 5 -> 3
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));
            // Non-variant stock 10 -> 7
            await db.Products.Where(p => p.Id == nonVariantProduct.Id)
                .ExecuteUpdateAsync(p => p.SetProperty(x => x.StockQuantity, 7));

            orderId = order.Id;
            skuId = sku.Id;
            variantProductId = variantProduct.Id;
            nonVariantProductId = nonVariantProduct.Id;
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
            Assert.True(result.IsSuccess, $"Cancel failed: {result.Error}");
        }

        // Verify:
        // SKU stock restored 3 -> 5
        // Variant Product stock remains 0 (not incremented)
        // Non-variant Product stock restored 7 -> 10
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var finalSkuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
            var finalVariantProdStock = await verifyDb.Products.AsNoTracking()
                .Where(p => p.Id == variantProductId).Select(p => p.StockQuantity).SingleAsync();
            var finalNonVariantProdStock = await verifyDb.Products.AsNoTracking()
                .Where(p => p.Id == nonVariantProductId).Select(p => p.StockQuantity).SingleAsync();

            Assert.Equal(5, finalSkuStock);
            Assert.Equal(0, finalVariantProdStock);
            Assert.Equal(10, finalNonVariantProdStock);
        }
    }

    [Fact]
    public async Task FLOW03_RmaCompletedWithoutQualityCheck_DoesNotRestoreStock()
    {
        Guid rmaId;
        Guid skuId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "RMA Product", $"rma-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "desc", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Customer", "cust@example.com", "0909000000",
                "123 Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");
            order.UpdateStatus(EOrderStatus.Processing);
            order.UpdateStatus(EOrderStatus.Shipped);
            order.UpdateStatus(EOrderStatus.Delivered);

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Checkout decremented SKU stock to 3
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            skuId = sku.Id;
            var orderItem = order.OrderItems.First();

            var rma = ReturnRequest.Create(
                order.Id, orderItem.Id, admin.Id, EReturnType.Return, EReturnReason.Defective,
                "Defective item", 1, 1000m);
            // Simulate bypassing QualityCheck directly to Completed (e.g. manual status manipulation or legacy data)
            rma.StartReview(admin.Id);
            typeof(ReturnRequest).GetProperty(nameof(ReturnRequest.Status))!
                .SetValue(rma, EReturnStatus.Completed);

            db.ReturnRequests.Add(rma);
            await db.SaveChangesAsync();

            rmaId = rma.Id;
        }

        // Dispatch completion event
        using (var scope = _factory.CreateScope())
        {
            var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();
            await publisher.Publish(new ReturnRequestCompletedEvent(
                rmaId, "RMA-CODE", Guid.NewGuid(), EReturnType.Return, 1000m));
        }

        // Stock must STILL be 3 because QualityCheck was never passed!
        using (var verify = _factory.CreateScope())
        {
            var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var currentSkuStock = await verifyDb.ProductVariantSkus.AsNoTracking()
                .Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();

            Assert.Equal(3, currentSkuStock);
        }
    }
}