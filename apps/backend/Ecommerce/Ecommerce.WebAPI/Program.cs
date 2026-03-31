using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Extensions;
using Ecommerce.Application.Features.Payments.VnPay;
using Ecommerce.Infrastructure;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Persistence.Seed;
using Ecommerce.Infrastructure.SignalR;
using Ecommerce.WebAPI.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using OfficeOpenXml;
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
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Configure VNPay Settings
builder.Services.Configure<VnPaySettings>(builder.Configuration.GetSection("VnPay"));

// Configure Auth Settings (for cookie-based auth)
builder.Services.Configure<AuthConfig>(builder.Configuration.GetSection("AuthConfig"));
builder.Services.Configure<CookieSettings>(builder.Configuration.GetSection("CookieSettings"));

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Global default: 100 requests/minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? ctx.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Stricter policy for auth endpoints: 10 requests/minute per IP
    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.Headers["Retry-After"] = "60";
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

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();

    // Always apply migrations
    //await context.Database.MigrateAsync();

    // Only seed data in Development
    if (app.Environment.IsDevelopment())
    {
        await ApplicationDbContextSeed.SeedAsync(services);
    }
}

app.UseRateLimiter();

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

app.Run();
