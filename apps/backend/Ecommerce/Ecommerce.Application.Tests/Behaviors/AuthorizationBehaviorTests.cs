using System.Security.Claims;
using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Policies;
using Ecommerce.Domain.Enums;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Behaviors;

public class AuthorizationBehaviorTests
{
    [Fact]
    public async Task Handle_RequestWithoutAuthorizeAttribute_CallsNext()
    {
        // Arrange
        var behavior = CreateBehavior<PublicRequest>(userId: null, principal: null);
        var nextCalls = 0;

        // Act
        var result = await behavior.Handle(new PublicRequest(), () =>
        {
            nextCalls++;
            return Task.FromResult(Result<string>.Success("ok"));
        }, CancellationToken.None);

        // Assert
        result.Value.Should().Be("ok");
        nextCalls.Should().Be(1);
    }

    [Fact]
    public async Task Handle_AuthorizedRequestWithoutUser_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var behavior = CreateBehavior<RoleProtectedRequest>(userId: null, principal: null);

        // Act
        var act = () => behavior.Handle(new RoleProtectedRequest(), () => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_RoleProtectedRequestWithMatchingRole_CallsNext()
    {
        // Arrange
        var behavior = CreateBehavior<RoleProtectedRequest>(Guid.NewGuid(), CreatePrincipal(role: EUserRoles.Admin));

        // Act
        var result = await behavior.Handle(new RoleProtectedRequest(), () => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

        // Assert
        result.Value.Should().Be("ok");
    }

    [Fact]
    public async Task Handle_RoleProtectedRequestWithoutMatchingRole_ThrowsForbiddenAccessException()
    {
        // Arrange
        var behavior = CreateBehavior<RoleProtectedRequest>(Guid.NewGuid(), CreatePrincipal(role: EUserRoles.Customer));

        // Act
        var act = () => behavior.Handle(new RoleProtectedRequest(), () => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenAccessException>();
    }

    [Fact]
    public async Task Handle_PolicyProtectedRequestWithPermissionClaim_CallsNext()
    {
        // Arrange
        var behavior = CreateBehavior<PolicyProtectedRequest>(Guid.NewGuid(), CreatePrincipal(permission: EPermissions.ViewProducts));

        // Act
        var result = await behavior.Handle(new PolicyProtectedRequest(), () => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

        // Assert
        result.Value.Should().Be("ok");
    }

    [Fact]
    public async Task Handle_CompositePolicyRequiresRoleAndPermission_CallsNextWhenBothMatch()
    {
        // Arrange
        var behavior = CreateBehavior<CompositePolicyProtectedRequest>(Guid.NewGuid(), CreatePrincipal(role: EUserRoles.Staff, permission: EPermissions.EditProduct));

        // Act
        var result = await behavior.Handle(new CompositePolicyProtectedRequest(), () => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

        // Assert
        result.Value.Should().Be("ok");
    }

    private static AuthorizationBehavior<TRequest, Result<string>> CreateBehavior<TRequest>(Guid? userId, ClaimsPrincipal? principal)
        where TRequest : IRequest<Result<string>>
    {
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.SetupGet(x => x.UserId).Returns(userId);

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        if (principal != null)
        {
            httpContextAccessor.SetupGet(x => x.HttpContext)
                .Returns(new DefaultHttpContext { User = principal });
        }

        return new AuthorizationBehavior<TRequest, Result<string>>(httpContextAccessor.Object, currentUserService.Object);
    }

    private static ClaimsPrincipal CreatePrincipal(string? role = null, string? permission = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        };

        if (role != null)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (permission != null)
        {
            claims.Add(new Claim(AuthorizationClaimTypes.Permission, permission));
        }

        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    public sealed class PublicRequest : IRequest<Result<string>>
    {
    }

    [Authorize(Roles = EUserRoles.Admin)]
    public sealed class RoleProtectedRequest : IRequest<Result<string>>
    {
    }

    [Authorize(Policy = EPermissions.ViewProducts)]
    public sealed class PolicyProtectedRequest : IRequest<Result<string>>
    {
    }

    [Authorize(Policy = AuthorizationPolicyNames.Staff.EditProduct)]
    public sealed class CompositePolicyProtectedRequest : IRequest<Result<string>>
    {
    }
}
