using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class Phase3OwnershipTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();
    private readonly HttpClient _client;

    public Phase3OwnershipTests()
    {
        _client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }

    [Fact]
    public async Task Customer_CannotDeleteAnotherUsersAddress()
    {
        var owner = await GetUserAsync("admin@Ecommerce.com");
        var addressId = await CreateAddressAsync(owner.Id);
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.DeleteAsync($"/api/addresses/{addressId}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Customer_CannotViewAnotherUsersReturnRequest()
    {
        var owner = await GetUserAsync("admin@Ecommerce.com");
        var returnRequestId = await CreateDeliveredOrderAndReturnAsync(owner.Id);
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.GetAsync($"/api/returns/{returnRequestId}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Customer_CannotCreateReturnForAnotherUsersOrder()
    {
        var owner = await GetUserAsync("admin@Ecommerce.com");
        var (orderId, orderItemId) = await CreateDeliveredOrderAsync(owner.Id);
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.PostAsJsonAsync("/api/returns", new
        {
            OrderId = orderId,
            OrderItemId = orderItemId,
            CustomerId = Guid.NewGuid(),
            Type = EReturnType.Return,
            Reason = EReturnReason.Defective,
            CustomerNote = "Not my order",
            Quantity = 1,
            EvidenceFiles = Array.Empty<object>()
        }, JsonOptions);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Customer_CannotViewAnotherUsersOrderHistory()
    {
        var owner = await GetUserAsync("admin@Ecommerce.com");
        var (orderId, _) = await CreateDeliveredOrderAsync(owner.Id);
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.GetAsync($"/api/orders/{orderId}/history");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_WishlistEndpoints_ReturnUnauthorized()
    {
        var response = await _client.GetAsync("/api/wishlist");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Customer_ClearSearchHistory_DoesNotAcceptTargetUserId()
    {
        var owner = await GetUserAsync("admin@Ecommerce.com");
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.DeleteAsync($"/api/searchsuggestions/search-history?userId={owner.Id}");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<ApplicationUser> GetUserAsync(string email)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        return await db.Users.SingleAsync(user => user.Email == email);
    }

    private async Task<Guid> CreateAddressAsync(Guid userId)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var address = new CustomerAddress
        {
            Id = Guid.NewGuid(),
            ApplicationUserId = userId,
            AddressType = "Home",
            FullName = "Owner User",
            Street = "123 Owner Street",
            City = "Test City",
            State = "Test State",
            PostalCode = "10000",
            Country = "VN",
            Phone = "0909000000",
            IsDefault = true
        };

        db.CustomerAddresses.Add(address);
        await db.SaveChangesAsync();
        return address.Id;
    }

    private async Task<Guid> CreateDeliveredOrderAndReturnAsync(Guid userId)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var (order, orderItem) = await CreateDeliveredOrderEntityAsync(db, userId);
        var returnRequest = ReturnRequest.Create(
            order.Id,
            orderItem.Id,
            userId,
            EReturnType.Return,
            EReturnReason.Defective,
            "Defective item",
            1,
            orderItem.UnitPrice,
            $"RMA-{Guid.NewGuid():N}"[..20]);

        db.ReturnRequests.Add(returnRequest);
        await db.SaveChangesAsync();
        return returnRequest.Id;
    }

    private async Task<(Guid OrderId, Guid OrderItemId)> CreateDeliveredOrderAsync(Guid userId)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var (order, orderItem) = await CreateDeliveredOrderEntityAsync(db, userId);
        await db.SaveChangesAsync();
        return (order.Id, orderItem.Id);
    }

    private static async Task<(Order Order, OrderItem OrderItem)> CreateDeliveredOrderEntityAsync(
        ApplicationDbContext db,
        Guid userId)
    {
        var product = await db.Products.FirstAsync();
        var order = Order.Create(
            userId,
            "Owner User",
            "owner@example.com",
            "0909000000",
            "123 Owner Street",
            null,
            null,
            null,
            $"ORD-{Guid.NewGuid():N}"[..20]);

        order.AddOrderItem(product.Id, product.Name, product.Image, 100000m, 1, null, null);
        order.UpdateStatus(EOrderStatus.Processing);
        order.UpdateStatus(EOrderStatus.Shipped);
        order.UpdateStatus(EOrderStatus.Delivered);
        db.Orders.Add(order);

        return (order, order.OrderItems.Single());
    }

    private async Task LoginAndAttachTokenAsync(string email, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        }, JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var accessToken = body?["data"]?["accessToken"]?.GetValue<string>();

        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }
}
