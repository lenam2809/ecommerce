using Ecommerce.Application.Common.Configs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddAuthenticationExtensions
    {
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            // Đăng ký JwtConfig options
            services.Configure<JwtConfig>(configuration.GetSection("Jwt"));
            
            // Đăng ký AuthConfig options
            services.Configure<AuthConfig>(configuration.GetSection("AuthConfig"));
            
            // Đăng ký CookieSettings options
            services.Configure<CookieSettings>(configuration.GetSection("CookieSettings"));

            var secretKey = configuration["Jwt:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
                throw new InvalidOperationException("Missing Jwt:SecretKey in configuration.");

            var key = Encoding.ASCII.GetBytes(secretKey);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // Get AuthConfig from DI
                        var authConfig = context.HttpContext.RequestServices
                            .GetService<IOptions<AuthConfig>>()?.Value ?? new AuthConfig();

                        // Priority 1: Check for token in httpOnly cookie (new way)
                        if (authConfig.UseCookieAuth)
                        {
                            var cookieToken = context.Request.Cookies["access_token"];
                            if (!string.IsNullOrEmpty(cookieToken))
                            {
                                context.Token = cookieToken;
                                return Task.CompletedTask;
                            }
                        }

                        // Priority 2: Check Authorization header (backward compatibility / mobile apps)
                        if (authConfig.AllowHeaderFallback)
                        {
                            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                            {
                                context.Token = authHeader.Substring(7);
                                return Task.CompletedTask;
                            }
                        }

                        // Priority 3: Check for token in query string (SignalR)
                        var queryToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(queryToken) && 
                            (path.StartsWithSegments("/notification-hub") || 
                             path.StartsWithSegments("/api/notification-hub") ||
                             path.StartsWithSegments("/api/reviewHub")))
                        {
                            context.Token = queryToken;
                        }

                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        // Allow anonymous endpoints to proceed even if authentication fails
                        // This is important for guest cart functionality
                        var endpoint = context.HttpContext.GetEndpoint();
                        var allowAnonymous = endpoint?.Metadata?.GetMetadata<Microsoft.AspNetCore.Authorization.IAllowAnonymous>() != null;

                        if (allowAnonymous)
                        {
                            context.NoResult();
                            return Task.CompletedTask;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }
    }

}
