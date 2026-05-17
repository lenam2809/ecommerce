using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToRole;
using Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToUser;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Authorization;

public class AuthorizationMaintainabilityTests
{
    [Fact]
    public async Task AssignPermissionToRole_WhenPermissionIsRevoked_InvalidatesRoleAuthorizationCache()
    {
        var role = new Role { Id = Guid.NewGuid(), Name = "Manager" };
        var permission = new Permission { Id = Guid.NewGuid(), Name = EPermissions.EditProduct, Description = "Edit products" };
        var unitOfWork = new Mock<IUnitOfWork>();
        var cacheInvalidation = new Mock<ICacheInvalidationService>();
        var logger = new Mock<IEnhancedLogger>();

        unitOfWork.Setup(x => x.Roles.GetByIdAsync(role.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(role);
        unitOfWork.Setup(x => x.Roles.GetPermissionsAsync(role))
            .ReturnsAsync(new List<Permission> { permission });
        unitOfWork.Setup(x => x.Permissions.GetByIdAsync(permission.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(permission);
        unitOfWork.Setup(x => x.Roles.RemovePermissionAsync(role, permission))
            .Returns(Task.CompletedTask);
        unitOfWork.Setup(x => x.Users.RefreshUserClaimsInRoleAsync(role.Name))
            .Returns(Task.CompletedTask);
        unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        cacheInvalidation.Setup(x => x.InvalidateRoleCache(role.Name))
            .Returns(Task.CompletedTask);
        logger.Setup(x => x.LogAsync(
                It.IsAny<ELogLevel>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<ELogType>(),
                It.IsAny<Dictionary<string, object?>>()))
            .Returns(Task.CompletedTask);

        var handler = new AssignPermissionToRoleCommandHandler(
            unitOfWork.Object,
            logger.Object,
            cacheInvalidation.Object);

        var result = await handler.Handle(
            new AssignPermissionToRoleCommand
            {
                RoleId = role.Id,
                PermissionIds = []
            },
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        unitOfWork.Verify(x => x.Roles.RemovePermissionAsync(role, permission), Times.Once);
        unitOfWork.Verify(x => x.Users.RefreshUserClaimsInRoleAsync(role.Name), Times.Once);
        cacheInvalidation.Verify(x => x.InvalidateRoleCache(role.Name), Times.Once);
        logger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            It.IsAny<string>(),
            "RolePermissionsChanged",
            ELogType.AccessControl,
            It.IsAny<Dictionary<string, object?>>()), Times.Once);
    }

    [Fact]
    public async Task AssignPermissionToUser_WhenPermissionIsRevoked_InvalidatesUserAuthorizationCache()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "staff@example.com",
            FirstName = "Staff",
            LastName = "User"
        };
        var permission = new Permission { Id = Guid.NewGuid(), Name = EPermissions.ViewReports, Description = "View reports" };
        var unitOfWork = new Mock<IUnitOfWork>();
        var cacheInvalidation = new Mock<ICacheInvalidationService>();
        var logger = new Mock<ILogger<AssignPermissionToUserCommandHandler>>();
        var auditLogger = new Mock<IEnhancedLogger>();

        unitOfWork.Setup(x => x.Users.GetByIdAsync(user.Id))
            .ReturnsAsync(user);
        unitOfWork.Setup(x => x.Users.GetPermissionsAsync(user))
            .ReturnsAsync(new List<Permission> { permission });
        unitOfWork.Setup(x => x.Permissions.GetByIdAsync(permission.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(permission);
        unitOfWork.Setup(x => x.Users.RemovePermissionAsync(user, permission))
            .ReturnsAsync(true);
        unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        cacheInvalidation.Setup(x => x.InvalidateUserCache(user.Id))
            .Returns(Task.CompletedTask);
        auditLogger.Setup(x => x.LogAsync(
                It.IsAny<ELogLevel>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<ELogType>(),
                It.IsAny<Dictionary<string, object?>>()))
            .Returns(Task.CompletedTask);

        var handler = new AssignPermissionToUserCommandHandler(
            unitOfWork.Object,
            logger.Object,
            cacheInvalidation.Object,
            auditLogger.Object);

        var result = await handler.Handle(
            new AssignPermissionToUserCommand
            {
                UserId = user.Id,
                PermissionIds = []
            },
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        unitOfWork.Verify(x => x.Users.RemovePermissionAsync(user, permission), Times.Once);
        cacheInvalidation.Verify(x => x.InvalidateUserCache(user.Id), Times.Once);
        auditLogger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            It.IsAny<string>(),
            "UserPermissionsChanged",
            ELogType.AccessControl,
            It.IsAny<Dictionary<string, object?>>()), Times.Once);
    }
}
