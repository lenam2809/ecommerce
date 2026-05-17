using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Policies;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Reflection;

namespace Ecommerce.Application.Common.Behaviors
{
    public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
            where TRequest : IRequest<TResponse>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentUserService _currentUserService;

        public AuthorizationBehavior(IHttpContextAccessor httpContextAccessor, ICurrentUserService currentUserService)
        {
            _httpContextAccessor = httpContextAccessor;
            _currentUserService = currentUserService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

            if (authorizeAttributes.Any())
            {
                // Must be authenticated user
                if (_currentUserService.UserId == null)
                {
                    throw new UnauthorizedAccessException();
                }

                // Role-based authorization
                var authorizeAttributesWithRoles = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Roles));
                if (authorizeAttributesWithRoles.Any())
                {
                    var authorized = false;
                    foreach (var roles in authorizeAttributesWithRoles.Select(a => a.Roles!.Split(',')))
                    {
                        foreach (var role in roles)
                        {
                            var user = _httpContextAccessor.HttpContext?.User;
                            if (user != null)
                            {
                                var isInRole = user.IsInRole(role.Trim());
                                if (isInRole)
                                {
                                    authorized = true;
                                    break;
                                }
                            }
                        }
                    }

                    // Must be in at least one role
                    if (!authorized)
                    {
                        throw new ForbiddenAccessException();
                    }
                }

                // Policy-based authorization
                var authorizeAttributesWithPolicies = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Policy));
                if (authorizeAttributesWithPolicies.Any())
                {
                    foreach (var policy in authorizeAttributesWithPolicies.Select(a => a.Policy))
                    {
                        var authorized = false;
                        var user = _httpContextAccessor.HttpContext?.User;

                        if (user != null)
                        {
                            if (policy!.Contains(':'))
                            {
                                var parts = policy.Split(':');
                                var roleName = parts[0];
                                var permissionName = parts[1];

                                if (user.IsInRole(roleName) && user.HasClaim(c => c.Type == AuthorizationClaimTypes.Permission && c.Value == permissionName))
                                {
                                    authorized = true;
                                }
                            }
                            else
                            {
                                // Simple policy check
                                if (user.HasClaim(c => c.Type == AuthorizationClaimTypes.Permission && c.Value == policy))
                                {
                                    authorized = true;
                                }
                            }
                        }

                        if (!authorized)
                        {
                            throw new ForbiddenAccessException();
                        }
                    }
                }
            }

            // Continue with the request
            return await next();
        }
    }
}

