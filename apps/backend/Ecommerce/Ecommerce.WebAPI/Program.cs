using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Observability;
using Ecommerce.Application.Extensions;
using Ecommerce.Application.Features.Payments.VnPay;
using Ecommerce.Infrastructure;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Persistence.Seed;
using Ecommerce.Infrastructure.SignalR;
using Ecommerce.WebAPI.Configuration;
using Ecommerce.WebAPI.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Globalization;
using System.Threading.RateLimiting;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Đăng ký SignalR TRƯỚC khi đăng ký Infrastructure
builder.Services.AddSignalR();

// Add services to the container.
builder.Services.AddHttpContextAccessor();
builder.Services.Configure<RequestLoggingOptions>(
    builder.Configuration.GetSection(RequestLoggingOptions.SectionName));
builder.Services.Configure<ObservabilityOptions>(
    builder.Configuration.GetSection(ObservabilityOptions.SectionName));
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var observabilityOptions = builder.Configuration
    .GetSection(ObservabilityOptions.SectionName)
    .Get<ObservabilityOptions>()
    ?? new ObservabilityOptions();

builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(
            serviceName: observabilityOptions.ServiceName,
            serviceVersion: observabilityOptions.ServiceVersion,
            serviceInstanceId: Environment.MachineName)
        .AddAttributes(new Dictionary<string, object>
        {
            ["deployment.environment"] = builder.Environment.EnvironmentName
        }))
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation(options =>
            {
                options.Filter = context => !context.Request.Path.StartsWithSegments("/metrics");
                options.EnrichWithHttpRequest = (activity, request) =>
                {
                    if (request.HttpContext.Items.TryGetValue(GlobalLogEnrichmentMiddleware.CorrelationIdItemKey, out var correlationId))
                    {
                        activity.SetTag("correlation.id", correlationId);
                    }
                };
                options.EnrichWithHttpResponse = (activity, response) =>
                {
                    activity.SetTag("http.response.status_code", response.StatusCode);
                };
            })
            .AddHttpClientInstrumentation()
            .AddEntityFrameworkCoreInstrumentation()
            .AddRedisInstrumentation()
            .AddOtlpExporter(options =>
            {
                options.Endpoint = new Uri(observabilityOptions.OtlpEndpoint);
            });
    })
    .WithMetrics(metrics =>
    {
        metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddMeter(EcommerceDiagnostics.MeterName)
            .AddPrometheusExporter();
    });

// Configure VNPay Settings
builder.Services.Configure<VnPaySettings>(builder.Configuration.GetSection("VnPay"));

// Configure Auth Settings (for cookie-based auth)
builder.Services.Configure<AuthConfig>(builder.Configuration.GetSection("AuthConfig"));
builder.Services.Configure<CookieSettings>(builder.Configuration.GetSection("CookieSettings"));
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Path = "/admin";
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Products.Delete", policy =>
        policy.RequireRole("Admin", "Manager"));
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Global default: 1000 requests/minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',')[0].Trim() ?? ctx.Connection.RemoteIpAddress?.ToString() ?? ctx.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 1000,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddPolicy("AuthPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',')[0].Trim() ?? context.Connection.RemoteIpAddress?.ToString() ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddPolicy("LoginPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',')[0].Trim() ?? context.Connection.RemoteIpAddress?.ToString() ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddPolicy("PasswordResetPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',')[0].Trim() ?? context.Connection.RemoteIpAddress?.ToString() ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(10),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers["Retry-After"] =
                Math.Ceiling(retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
        }
        else
        {
            context.HttpContext.Response.Headers["Retry-After"] = "60";
        }
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
            cancellationToken);
    };
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình CORS đúng cách - PHẢI dùng WithOrigins khi AllowCredentials
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
    var isDevelopment = builder.Environment.IsDevelopment();

    options.AddPolicy("AllowAll",
        policy =>
        {
            if (allowedOrigins != null && allowedOrigins.Length > 0)
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials()  // Required for cookies
                      .WithExposedHeaders("Set-Cookie");  // Allow cookie headers
            }
            else if (isDevelopment)
            {
                // Development fallback - allow all origins without credentials
                policy.SetIsOriginAllowed(_ => true)  // Allow any origin
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .WithExposedHeaders("Set-Cookie");
                // NOTE: AllowCredentials() removed - cannot use with AllowAnyOrigin
            }
            else
            {
                // Production: MUST have explicit origins configured
                throw new InvalidOperationException(
                    "CORS configuration error: In production, Cors:AllowedOrigins must be explicitly configured in appsettings. " +
                    "AllowAnyOrigin() cannot be used with AllowCredentials()."
                );
            }
        });
});

ExcelPackage.License.SetNonCommercialPersonal("Ecommerce");

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseOpenTelemetryPrometheusScrapingEndpoint();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();

    // Always apply migrations
    await context.Database.MigrateAsync();
    //await ApplicationDbContextSeed.SeedAsync(services, app.Environment.IsDevelopment());
    await ApplicationDbContextSeed.SeedAsync(services, true);

}

app.UseRateLimiter();

app.UseSecurityHeaders();

app.UseGlobalLogEnrichment();

app.UseRequestLogging();

app.UseGlobalExceptionHandling();

app.UseRouting();

// Đặt middleware CORS sau UseRouting và trước UseAuthentication
app.UseCors("AllowAll");

//app.UseHttpsRedirection();

// Thêm middleware để phục vụ hình ảnh tĩnh
app.UseStaticFiles();

app.UseAuthentication();

// CSRF Protection middleware - sau Authentication, trước Authorization
app.UseCsrfValidation();

app.UseAuthorization();

app.MapHub<NotificationHub>("/api/notification-hub");
app.MapHub<ReviewHub>("/api/reviewHub");

app.MapControllers();

app.MapGet("/", () => "API is running");

// C1: Health check endpoint độc lập với Swagger - dùng cho Docker health check
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0"
})).AllowAnonymous();

app.Run();
