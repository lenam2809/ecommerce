using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Extensions;
using Ecommerce.Application.Features.Payments.VnPay;
using Ecommerce.Infrastructure;
using Ecommerce.Infrastructure.Persistence.Seed;
using Ecommerce.Infrastructure.SignalR;
using Ecommerce.WebAPI.Middleware;
using OfficeOpenXml;

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

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình CORS đúng cách - PHẢI dùng WithOrigins khi AllowCredentials
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
    
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
            else 
            {
                // Fallback cho dev - KHÔNG dùng AllowCredentials với AllowAnyOrigin
                policy.SetIsOriginAllowed(_ => true)  // Allow any origin
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials()
                      .WithExposedHeaders("Set-Cookie");
            }
        });
});

ExcelPackage.License.SetNonCommercialPersonal("Ecommerce");

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await ApplicationDbContextSeed.SeedAsync(services);
}

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
