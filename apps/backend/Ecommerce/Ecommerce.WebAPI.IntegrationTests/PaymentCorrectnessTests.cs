using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class PaymentCorrectnessTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();
    private readonly HttpClient _client;

    public PaymentCorrectnessTests()
    {
        _client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }

    [Fact]
    public async Task Anonymous_CreatePaymentUrl_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/Payments/vnpay/create-url", new
        {
            OrderId = Guid.NewGuid()
        }, JsonOptions);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Customer_CreatePaymentUrlForOwnOrder_IgnoresClientAmount()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 125000m, quantity: 2);
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.PostAsJsonAsync("/api/Payments/vnpay/create-url", new
        {
            OrderId = order.Id,
            Amount = 1,
            OrderDescription = "client supplied value"
        }, JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.True(body?["success"]?.GetValue<bool>());
        Assert.Equal(250000m, body?["data"]?["amount"]?.GetValue<decimal>());

        var paymentUrl = body?["data"]?["paymentUrl"]?.GetValue<string>();
        Assert.False(string.IsNullOrWhiteSpace(paymentUrl));
        Assert.Contains("vnp_Amount=25000000", paymentUrl);
        Assert.DoesNotContain("vnp_Amount=100", paymentUrl);
    }

    [Fact]
    public async Task Customer_CreatePaymentUrlForAnotherUsersOrder_ReturnsForbidden()
    {
        var admin = await GetUserAsync("admin@Ecommerce.com");
        var order = await CreateOrderAsync(admin.Id);
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.PostAsJsonAsync("/api/Payments/vnpay/create-url", new
        {
            OrderId = order.Id
        }, JsonOptions);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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

    private async Task<Order> CreateOrderAsync(Guid userId, decimal unitPrice = 100000m, int quantity = 1)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var order = Order.Create(
            userId,
            "Test User",
            "customer@example.com",
            "0909000000",
            "123 Test Street",
            null,
            null,
            null);

        var product = await db.Products.FirstAsync();
        order.AddOrderItem(product.Id, product.Name, product.Image, unitPrice, quantity, null, null);
        await db.Orders.AddAsync(order);
        await db.SaveChangesAsync();
        return order;
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
