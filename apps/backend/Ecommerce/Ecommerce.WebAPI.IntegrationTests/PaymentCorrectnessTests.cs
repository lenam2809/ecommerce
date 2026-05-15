using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
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

    [Fact]
    public async Task VnPayIpn_ValidSuccess_UpdatesPaymentTransactionPaymentAndOrder()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 125000m, quantity: 2);
        var query = BuildSignedVnPayQuery(order.Id, 250000m, responseCode: "00", transactionNo: "txn-success-1");

        var response = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.Equal("00", body?["rspCode"]?.GetValue<string>());

        await AssertPaymentStateAsync(
            order.Id,
            PaymentTransactionStatus.Success,
            "00",
            EOrderStatus.Processing,
            expectedSuccessfulPayments: 1);
    }

    [Fact]
    public async Task VnPayIpn_DuplicateValidSuccess_DoesNotCreateDuplicatePayment()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 125000m, quantity: 2);
        var query = BuildSignedVnPayQuery(order.Id, 250000m, responseCode: "00", transactionNo: "txn-duplicate-1");

        var firstResponse = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");
        var secondResponse = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);

        await AssertPaymentStateAsync(
            order.Id,
            PaymentTransactionStatus.Success,
            "00",
            EOrderStatus.Processing,
            expectedSuccessfulPayments: 1);
    }

    [Fact]
    public async Task VnPayReturnBeforeIpn_DuplicateCallback_DoesNotCreateDuplicatePayment()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 100000m, quantity: 1);
        var query = BuildSignedVnPayQuery(order.Id, 100000m, responseCode: "00", transactionNo: "txn-return-ipn-1");

        var returnResponse = await _client.GetAsync($"/api/Payments/vnpay/return?{query}");
        var ipnResponse = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");

        Assert.Equal(HttpStatusCode.Redirect, returnResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, ipnResponse.StatusCode);

        await AssertPaymentStateAsync(
            order.Id,
            PaymentTransactionStatus.Success,
            "00",
            EOrderStatus.Processing,
            expectedSuccessfulPayments: 1);
    }

    [Fact]
    public async Task VnPayIpn_InvalidSignature_DoesNotUpdatePaymentOrOrder()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 100000m, quantity: 1);
        var query = BuildSignedVnPayQuery(order.Id, 100000m, responseCode: "00", transactionNo: "txn-invalid-signature");
        query = query.Replace("vnp_SecureHash=", "vnp_SecureHash=bad");

        var response = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.Equal("97", body?["rspCode"]?.GetValue<string>());

        await AssertPaymentStateAsync(
            order.Id,
            expectedTransactionStatus: null,
            expectedResponseCode: null,
            expectedOrderStatus: EOrderStatus.Pending,
            expectedSuccessfulPayments: 0);
    }

    [Fact]
    public async Task VnPayIpn_AmountMismatch_MarksTransactionFailedAndDoesNotMarkOrderPaid()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 100000m, quantity: 1);
        var query = BuildSignedVnPayQuery(order.Id, 90000m, responseCode: "00", transactionNo: "txn-amount-mismatch");

        var response = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.Equal("04", body?["rspCode"]?.GetValue<string>());

        await AssertPaymentStateAsync(
            order.Id,
            PaymentTransactionStatus.Failed,
            "AMOUNT_MISMATCH",
            EOrderStatus.Pending,
            expectedSuccessfulPayments: 0);
    }

    [Fact]
    public async Task VnPayIpn_FailedResponseCode_MarksTransactionFailedAndDoesNotMarkOrderPaid()
    {
        var user = await GetUserAsync("customer@example.com");
        var order = await CreateOrderAsync(user.Id, unitPrice: 100000m, quantity: 1);
        var query = BuildSignedVnPayQuery(order.Id, 100000m, responseCode: "24", transactionNo: "txn-failed-response");

        var response = await _client.GetAsync($"/api/Payments/vnpay/ipn?{query}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.Equal("00", body?["rspCode"]?.GetValue<string>());

        await AssertPaymentStateAsync(
            order.Id,
            PaymentTransactionStatus.Failed,
            "24",
            EOrderStatus.Pending,
            expectedSuccessfulPayments: 0);
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

    private async Task AssertPaymentStateAsync(
        Guid orderId,
        PaymentTransactionStatus? expectedTransactionStatus,
        string? expectedResponseCode,
        EOrderStatus expectedOrderStatus,
        int expectedSuccessfulPayments)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var order = await db.Orders.SingleAsync(x => x.Id == orderId);
        Assert.Equal(expectedOrderStatus, order.Status);

        var successfulPayments = await db.Set<Payment>()
            .Where(x => x.OrderId == orderId && x.IsSuccessful)
            .ToListAsync();
        Assert.Equal(expectedSuccessfulPayments, successfulPayments.Count);

        var txnRef = orderId.ToString("D");
        var transaction = await db.PaymentTransactions.SingleOrDefaultAsync(x => x.TxnRef == txnRef);
        if (expectedTransactionStatus.HasValue)
        {
            Assert.NotNull(transaction);
            Assert.Equal(expectedTransactionStatus.Value, transaction!.Status);
            Assert.Equal(expectedResponseCode, transaction.ResponseCode);
        }
        else
        {
            Assert.Null(transaction);
        }
    }

    private static string BuildSignedVnPayQuery(
        Guid orderId,
        decimal amount,
        string responseCode,
        string transactionNo)
    {
        var createDate = TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.UtcNow,
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"))
            .ToString("yyyyMMddHHmmss");

        var requestData = new SortedList<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Amount"] = ((long)(amount * 100m)).ToString(),
            ["vnp_CreateDate"] = createDate,
            ["vnp_OrderInfo"] = $"Thanh toan don hang {orderId:D}",
            ["vnp_ResponseCode"] = responseCode,
            ["vnp_TransactionNo"] = transactionNo,
            ["vnp_TxnRef"] = orderId.ToString("D")
        };

        var queryString = string.Join("&", requestData.Select(x =>
            $"{WebUtility.UrlEncode(x.Key)}={WebUtility.UrlEncode(x.Value)}"));
        var secureHash = HmacSha512("integration-test-vnpay-hash-secret", queryString);
        return $"{queryString}&vnp_SecureHash={secureHash}";
    }

    private static string HmacSha512(string key, string inputData)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        using var hmac = new HMACSHA512(keyBytes);
        return Convert.ToHexString(hmac.ComputeHash(inputBytes)).ToLowerInvariant();
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
