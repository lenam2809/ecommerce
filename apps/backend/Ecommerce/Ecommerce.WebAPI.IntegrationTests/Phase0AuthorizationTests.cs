using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class Phase0AuthorizationTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();
    private readonly HttpClient _client;

    public Phase0AuthorizationTests()
    {
        _client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }

    [Theory]
    [InlineData("/api/About")]
    [InlineData("/api/Contact")]
    [InlineData("/api/Banner")]
    [InlineData("/api/Brands")]
    [InlineData("/api/Categories")]
    [InlineData("/api/promo-codes")]
    [InlineData("/api/products/validate-import")]
    public async Task Anonymous_AdminMutationEndpoint_ReturnsUnauthorized(string url)
    {
        using var content = new MultipartFormDataContent();

        var response = await _client.PostAsync(url, content);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Customer_ReportEndpoint_ReturnsForbidden()
    {
        await LoginAndAttachTokenAsync("customer@example.com", "Customer@123");

        var response = await _client.GetAsync("/api/Reports/revenue-overview");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PublicReadEndpoint_RemainsPublic()
    {
        var response = await _client.GetAsync("/api/Categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/TestStorage/url?path=test.png")]
    [InlineData("/WeatherForecast")]
    public async Task DevOnlyEndpoint_InIntegrationTesting_ReturnsNotFound(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
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
