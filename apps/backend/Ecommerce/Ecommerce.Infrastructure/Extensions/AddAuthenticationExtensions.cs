using Ecommerce.Application.Common.Configs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddAuthenticationExtensions
    {
        public static IServiceCollection AddJwtAuthentication(
            this IServiceCollection services,
            IConfiguration configuration,
            bool requireHttpsMetadata = true)
        {
            services.Configure<JwtConfig>(configuration.GetSection("Jwt"));
            services.Configure<AuthConfig>(configuration.GetSection("AuthConfig"));
            services.Configure<CookieSettings>(configuration.GetSection("CookieSettings"));

            var secretKey = configuration["Jwt:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException("Missing Jwt:SecretKey in configuration.");
            }

            var key = Encoding.ASCII.GetBytes(secretKey);

            var authenticationBuilder = services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = requireHttpsMetadata;
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
                        var authConfig = context.HttpContext.RequestServices
                            .GetService<IOptions<AuthConfig>>()?.Value ?? new AuthConfig();

                        if (authConfig.UseCookieAuth)
                        {
                            var cookieToken = context.Request.Cookies["access_token"];
                            if (!string.IsNullOrEmpty(cookieToken))
                            {
                                context.Token = cookieToken;
                                return Task.CompletedTask;
                            }
                        }

                        if (authConfig.AllowHeaderFallback)
                        {
                            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                            {
                                context.Token = authHeader[7..];
                                return Task.CompletedTask;
                            }
                        }

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
                        var endpoint = context.HttpContext.GetEndpoint();
                        var allowAnonymous = endpoint?.Metadata?.GetMetadata<Microsoft.AspNetCore.Authorization.IAllowAnonymous>() != null;

                        if (allowAnonymous)
                        {
                            context.NoResult();
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            var googleClientId = configuration["Authentication:Google:ClientId"];
            var googleClientSecret = configuration["Authentication:Google:ClientSecret"];
            if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
            {
                authenticationBuilder.AddGoogle("Google", options =>
                {
                    options.ClientId = googleClientId;
                    options.ClientSecret = googleClientSecret;
                    options.SignInScheme = IdentityConstants.ExternalScheme;
                    options.CallbackPath = "/api/auth/google-oauth-callback";
                    options.SaveTokens = false;
                    options.Scope.Add("profile");
                    options.Events.OnCreatingTicket = context =>
                    {
                        if (context.User.TryGetProperty("picture", out var picture) &&
                            !string.IsNullOrWhiteSpace(picture.GetString()) &&
                            context.Identity != null)
                        {
                            context.Identity.AddClaim(new Claim("picture", picture.GetString()!));
                        }

                        return Task.CompletedTask;
                    };
                    options.Events.OnRedirectToAuthorizationEndpoint = context =>
                    {
                        var callbackUrl = configuration["Authentication:Google:CallbackUrl"];
                        if (string.IsNullOrWhiteSpace(callbackUrl))
                        {
                            var frontendUrl = configuration["AppUrl:Frontend"] ?? "http://localhost:3000";
                            callbackUrl = $"{frontendUrl.TrimEnd('/')}/api/auth/google-oauth-callback";
                        }

                        var authorizationUri = new UriBuilder(context.RedirectUri);
                        var query = QueryHelpers.ParseQuery(authorizationUri.Query)
                            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString(), StringComparer.OrdinalIgnoreCase);
                        query["redirect_uri"] = callbackUrl;
                        authorizationUri.Query = QueryString
                            .Create(query.Select(kvp => new KeyValuePair<string, string?>(kvp.Key, kvp.Value)))
                            .ToString();

                        context.Response.Redirect(authorizationUri.ToString());
                        return Task.CompletedTask;
                    };
                });
            }

            return services;
        }
    }
}
