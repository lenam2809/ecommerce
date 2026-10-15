using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Identity;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Persistence.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class Phase2ASecurityTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private HttpClient NewClient(bool handleCookies = false) =>
        _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = handleCookies
        });

    // ─────────────────────────────────────────────────────────────
    // SEC-04: Refresh Token & Expired Access Token Flow
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task SEC04_RefreshToken_WithValidExpiredAccessToken_SucceedsAndRotates()
    {
        using var client = NewClient();

        // 1. Login to obtain valid tokens
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var rawRefreshToken = loginBody?["data"]?["refreshToken"]?.GetValue<string>();
        var userId = loginBody?["data"]?["userId"]?.GetValue<string>();
        Assert.False(string.IsNullOrWhiteSpace(rawRefreshToken));
        Assert.False(string.IsNullOrWhiteSpace(userId));

        // 2. Generate an intentionally expired access token for the SAME user with correct signature
        var expiredToken = CreateJwtToken(
            userId: userId!,
            email: "customer@example.com",
            roles: ["Customer"],
            expiresAt: DateTime.UtcNow.AddMinutes(-5));

        // 3. Call refresh-token passing the expired access token and valid refresh token
        using var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new
            {
                AccessToken = expiredToken,
                RefreshToken = rawRefreshToken
            }, options: JsonOptions)
        };

        var refreshResponse = await client.SendAsync(refreshRequest);
        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        var refreshBody = await refreshResponse.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var newAccessToken = refreshBody?["data"]?["accessToken"]?.GetValue<string>();
        var newRefreshToken = refreshBody?["data"]?["refreshToken"]?.GetValue<string>();

        Assert.False(string.IsNullOrWhiteSpace(newAccessToken));
        Assert.False(string.IsNullOrWhiteSpace(newRefreshToken));
        Assert.NotEqual(rawRefreshToken, newRefreshToken);
    }

    [Fact]
    public async Task SEC04_RefreshToken_WithTamperedAccessTokenSignature_FailsWithBadRequest()
    {
        using var client = NewClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var rawRefreshToken = loginBody?["data"]?["refreshToken"]?.GetValue<string>();
        var userId = loginBody?["data"]?["userId"]?.GetValue<string>();

        // Generate expired token and tamper with the signature (last part)
        var validToken = CreateJwtToken(
            userId: userId!,
            email: "customer@example.com",
            roles: ["Customer"],
            expiresAt: DateTime.UtcNow.AddMinutes(-5));

        var parts = validToken.Split('.');
        var tamperedSignature = parts[2].Length > 5
            ? parts[2][..^5] + "AAAAA"
            : "INVALID_SIG";
        var tamperedToken = $"{parts[0]}.{parts[1]}.{tamperedSignature}";

        using var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new
            {
                AccessToken = tamperedToken,
                RefreshToken = rawRefreshToken
            }, options: JsonOptions)
        };

        var refreshResponse = await client.SendAsync(refreshRequest);
        Assert.Equal(HttpStatusCode.BadRequest, refreshResponse.StatusCode);
    }

    [Fact]
    public async Task SEC04_RefreshToken_WithMismatchedUserAccessToken_FailsWithBadRequest()
    {
        using var client = NewClient();

        // Customer login
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var customerRefreshToken = loginBody?["data"]?["refreshToken"]?.GetValue<string>();

        // Generate an access token for a DIFFERENT user (e.g. random Guid)
        var differentUserId = Guid.NewGuid().ToString();
        var mismatchedToken = CreateJwtToken(
            userId: differentUserId,
            email: "other@example.com",
            roles: ["Customer"],
            expiresAt: DateTime.UtcNow.AddMinutes(-5));

        using var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new
            {
                AccessToken = mismatchedToken,
                RefreshToken = customerRefreshToken
            }, options: JsonOptions)
        };

        var refreshResponse = await client.SendAsync(refreshRequest);
        Assert.Equal(HttpStatusCode.BadRequest, refreshResponse.StatusCode);
    }

    [Fact]
    public async Task SEC04_RefreshToken_ReplayAttack_RevokesAllSessionsAndReturns401()
    {
        using var client = NewClient();

        // 1. Initial Login
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var token1 = loginBody?["data"]?["refreshToken"]?.GetValue<string>();
        Assert.False(string.IsNullOrWhiteSpace(token1));

        // 2. First Refresh (legitimate rotation)
        using var req1 = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new { RefreshToken = token1 }, options: JsonOptions)
        };
        var res1 = await client.SendAsync(req1);
        Assert.Equal(HttpStatusCode.OK, res1.StatusCode);

        var body1 = await res1.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var token2 = body1?["data"]?["refreshToken"]?.GetValue<string>();
        Assert.NotEqual(token1, token2);

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();
            var h = tokenService.HashToken(token1);
            var t1InDb = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == h || rt.Token == h);
            Assert.NotNull(t1InDb);
            Assert.True(t1InDb.IsRevoked, $"Expected t1InDb to be revoked in DB after first refresh, but IsRevoked was {t1InDb.IsRevoked}.");
        }

        // 3. Replay attack: try to use the revoked token1 again with a fresh client (no cookie state)
        using var replayClient1 = NewClient();
        using var req2 = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new { RefreshToken = token1 }, options: JsonOptions)
        };
        var res2 = await replayClient1.SendAsync(req2);
        var res2Text = await res2.Content.ReadAsStringAsync();
        Assert.True(
            res2.StatusCode == HttpStatusCode.Unauthorized,
            $"Expected 401 Unauthorized for replay attack, but got {(int)res2.StatusCode} with body: {res2Text}");

        // 4. Verify in DB that all tokens for the user were revoked
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var allTokens = await db.RefreshTokens.ToListAsync();
            var unrevoked = allTokens.Where(t => !t.IsRevoked).ToList();
            Assert.True(
                unrevoked.Count == 0,
                $"Tokens in DB: {string.Join(" | ", allTokens.Select(t => $"Id={t.Id}, User={t.ApplicationUserId}, Revoked={t.IsRevoked}, Hash={t.TokenHash?[..8]}"))}");
        }

        // 5. Verify token2 was also rejected
        using var replayClient2 = NewClient();
        using var req3 = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new { RefreshToken = token2 }, options: JsonOptions)
        };
        var res3 = await replayClient2.SendAsync(req3);
        var res3Text = await res3.Content.ReadAsStringAsync();
        Assert.True(
            res3.StatusCode == HttpStatusCode.Unauthorized,
            $"Expected 401 Unauthorized for token2 after replay, but got {(int)res3.StatusCode} with body: {res3Text}");
    }

    // ─────────────────────────────────────────────────────────────
    // SEC-05: CSRF Validation with Refresh Token
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task SEC05_Csrf_RefreshToken_MissingCsrfHeader_Returns403WhenCsrfEnabled()
    {
        using var csrfFactory = new CustomWebApplicationFactory(enableCsrfProtection: true);
        using var client = csrfFactory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = false
        });

        // 1. Login to get cookies
        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var cookies = login.Headers.GetValues("Set-Cookie").ToList();
        var refreshCookie = cookies.FirstOrDefault(c => c.StartsWith("refresh_token="));
        var csrfCookie = cookies.FirstOrDefault(c => c.StartsWith("csrf_token="));

        Assert.NotNull(refreshCookie);
        Assert.NotNull(csrfCookie);

        var rawRefreshToken = refreshCookie.Split(';')[0].Split('=')[1];
        var rawCsrfToken = csrfCookie.Split(';')[0].Split('=')[1];

        // 2. Request refresh with refresh_token & csrf_token cookies, but WITHOUT X-CSRF-Token header
        using var requestWithoutHeader = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new { }, options: JsonOptions)
        };
        requestWithoutHeader.Headers.Add("Cookie", $"refresh_token={rawRefreshToken}; csrf_token={rawCsrfToken}");

        var resForbidden = await client.SendAsync(requestWithoutHeader);
        Assert.Equal(HttpStatusCode.Forbidden, resForbidden.StatusCode);

        // 3. Request refresh WITH matching X-CSRF-Token header -> should succeed
        using var requestWithHeader = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new { }, options: JsonOptions)
        };
        requestWithHeader.Headers.Add("Cookie", $"refresh_token={rawRefreshToken}; csrf_token={rawCsrfToken}");
        requestWithHeader.Headers.Add("X-CSRF-Token", rawCsrfToken);

        var resSuccess = await client.SendAsync(requestWithHeader);
        Assert.Equal(HttpStatusCode.OK, resSuccess.StatusCode);
    }

    // ─────────────────────────────────────────────────────────────
    // SEC-07: Seeding Behavior in Production vs Development
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task SEC07_ProductionSeeding_DoesNotCreateDefaultAccountsOrSampleProducts()
    {
        using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddDbContext<ApplicationDbContext>(opts => opts.UseSqlite(connection));
        services.AddIdentity<ApplicationUser, Role>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var provider = services.BuildServiceProvider();

        using (var scope = provider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await context.Database.EnsureCreatedAsync();

            // Run seed in Production mode without bootstrap credentials
            var emptyConfig = new ConfigurationBuilder().Build();
            await ApplicationDbContextSeed.SeedAsync(scope.ServiceProvider, isDevelopment: false, emptyConfig);

            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            // Assert NO default hardcoded accounts exist
            Assert.Null(await userManager.FindByEmailAsync("admin@Ecommerce.com"));
            Assert.Null(await userManager.FindByEmailAsync("manager@Ecommerce.com"));
            Assert.Null(await userManager.FindByEmailAsync("staff@Ecommerce.com"));
            Assert.Null(await userManager.FindByEmailAsync("customer@example.com"));

            // Assert no sample products were created
            var productCount = await context.Products.CountAsync();
            Assert.Equal(0, productCount);

            // Assert required dictionary roles still exist
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();
            Assert.True(await roleManager.RoleExistsAsync(EUserRoles.Admin));
            Assert.True(await roleManager.RoleExistsAsync(EUserRoles.Customer));
        }
    }

    [Fact]
    public async Task SEC07_ProductionSeeding_WithBootstrapAdmin_CreatesAdminWithMustChangePassword()
    {
        using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddDbContext<ApplicationDbContext>(opts => opts.UseSqlite(connection));
        services.AddIdentity<ApplicationUser, Role>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var provider = services.BuildServiceProvider();

        using (var scope = provider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await context.Database.EnsureCreatedAsync();

            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Seed:AdminEmail"] = "bootstrap.admin@company.com",
                    ["Seed:AdminPassword"] = "SecureBootstrap@999"
                })
                .Build();

            await ApplicationDbContextSeed.SeedAsync(scope.ServiceProvider, isDevelopment: false, config);

            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var bootstrapAdmin = await userManager.FindByEmailAsync("bootstrap.admin@company.com");

            Assert.NotNull(bootstrapAdmin);
            Assert.True(bootstrapAdmin.MustChangePassword, "Bootstrap admin in production must have MustChangePassword = true.");
            Assert.True(await userManager.IsInRoleAsync(bootstrapAdmin, EUserRoles.Admin));

            // Default dev accounts still must NOT exist
            Assert.Null(await userManager.FindByEmailAsync("admin@Ecommerce.com"));
            Assert.Null(await userManager.FindByEmailAsync("customer@example.com"));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SEC-12: UTC Consistency in TokenService
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public void SEC12_TokenService_GenerateAccessToken_SetsExpirationInUtc()
    {
        var jwtConfig = Options.Create(new JwtConfig
        {
            SecretKey = "super-secret-key-for-testing-purposes-123",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            AccessTokenExpirationMinutes = 15
        });

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Auth:TokenHashSecret"] = "test-hash-secret"
            })
            .Build();

        var tokenService = new TokenService(jwtConfig, config);
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User"
        };

        var before = DateTime.UtcNow.AddMinutes(15);
        var token = tokenService.GenerateAccessToken(user, ["Customer"], []);
        var after = DateTime.UtcNow.AddMinutes(15);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal(DateTimeKind.Utc, jwt.ValidTo.Kind);
        Assert.True(jwt.ValidTo >= before.AddSeconds(-2) && jwt.ValidTo <= after.AddSeconds(2),
            $"ValidTo ({jwt.ValidTo:o}) was expected to be between {before:o} and {after:o}");
    }

    // ─────────────────────────────────────────────────────────────
    // FE-03: Backend Profile Endpoint Role Segregation
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FE03_Backend_MeProfile_DistinguishesCustomerFromAdminAndStaff()
    {
        using var client = NewClient();

        // 1. Customer profile returns role Customer
        var customerLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        var customerBody = await customerLogin.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var customerToken = customerBody?["data"]?["accessToken"]?.GetValue<string>();

        using var customerReq = new HttpRequestMessage(HttpMethod.Get, "/api/auth/me/profile");
        customerReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        var customerRes = await client.SendAsync(customerReq);
        Assert.Equal(HttpStatusCode.OK, customerRes.StatusCode);

        var customerProfile = await customerRes.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var customerRoles = customerProfile?["roles"]?.AsArray().Select(r => r?.GetValue<string>()).ToList();
        Assert.NotNull(customerRoles);
        Assert.Contains("Customer", customerRoles);
        Assert.DoesNotContain("Admin", customerRoles);
        Assert.DoesNotContain("Manager", customerRoles);
        Assert.DoesNotContain("Staff", customerRoles);

        // 2. Admin profile returns role Admin
        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@Ecommerce.com",
            Password = "Admin@123456"
        }, JsonOptions);
        var adminBody = await adminLogin.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var adminToken = adminBody?["data"]?["accessToken"]?.GetValue<string>();

        using var adminReq = new HttpRequestMessage(HttpMethod.Get, "/api/auth/me/profile");
        adminReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var adminRes = await client.SendAsync(adminReq);
        Assert.Equal(HttpStatusCode.OK, adminRes.StatusCode);

        var adminProfile = await adminRes.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var adminRoles = adminProfile?["roles"]?.AsArray().Select(r => r?.GetValue<string>()).ToList();
        Assert.NotNull(adminRoles);
        Assert.Contains("Admin", adminRoles);

        // 3. Anonymous returns 401
        using var anonReq = new HttpRequestMessage(HttpMethod.Get, "/api/auth/me/profile");
        var anonRes = await client.SendAsync(anonReq);
        Assert.Equal(HttpStatusCode.Unauthorized, anonRes.StatusCode);
    }

    private static string CreateJwtToken(string userId, string email, IEnumerable<string> roles, DateTime expiresAt)
    {
        var key = Encoding.ASCII.GetBytes("integration-test-secret-key-with-more-than-32-chars");
        var tokenHandler = new JwtSecurityTokenHandler();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, email),
            new(ClaimTypes.Email, email)
        };
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            NotBefore = expiresAt.AddMinutes(-15),
            IssuedAt = expiresAt.AddMinutes(-15),
            Expires = expiresAt,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = "Ecommerce.IntegrationTests",
            Audience = "Ecommerce.IntegrationTests"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
