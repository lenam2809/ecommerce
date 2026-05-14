using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class Phase0RuntimeHardeningTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new(enableCsrfProtection: true);
    private readonly HttpClient _client;

    public Phase0RuntimeHardeningTests()
    {
        _client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }

    [Theory]
    [InlineData("/swagger")]
    [InlineData("/swagger/index.html")]
    public async Task Swagger_InNonDevelopmentEnvironment_ReturnsNotFound(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task HttpRequest_InNonDevelopmentEnvironment_RedirectsToHttps()
    {
        using var httpClient = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("http://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = true
        });

        var response = await httpClient.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.TemporaryRedirect, response.StatusCode);
        Assert.Equal("https", response.Headers.Location?.Scheme);
    }

    [Fact]
    public async Task Login_WithoutCsrfHeader_ReturnsOkAndSetsCsrfCookie()
    {
        var response = await LoginAsAdminAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), cookie =>
            cookie.StartsWith("csrf_token=", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task CookieAuthenticatedMutation_WithoutCsrfHeader_ReturnsForbidden()
    {
        var loginResponse = await LoginAsAdminAsync();
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        AttachAuthAndCsrfCookies(loginResponse);

        using var content = new MultipartFormDataContent();
        var response = await _client.PostAsync("/api/products/validate-import", content);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.Equal("CSRF_VALIDATION_FAILED", body?["errorCode"]?.GetValue<string>());
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<HttpResponseMessage> LoginAsAdminAsync()
    {
        return await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@Ecommerce.com",
            Password = "Admin@123456"
        }, JsonOptions);
    }

    private void AttachAuthAndCsrfCookies(HttpResponseMessage loginResponse)
    {
        var cookies = loginResponse.Headers
            .GetValues("Set-Cookie")
            .Select(cookie => cookie.Split(';', 2)[0])
            .Where(cookie =>
                cookie.StartsWith("access_token=", StringComparison.OrdinalIgnoreCase) ||
                cookie.StartsWith("csrf_token=", StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.Equal(2, cookies.Count);
        _client.DefaultRequestHeaders.Remove("Cookie");
        _client.DefaultRequestHeaders.Add("Cookie", string.Join("; ", cookies));
    }
}
