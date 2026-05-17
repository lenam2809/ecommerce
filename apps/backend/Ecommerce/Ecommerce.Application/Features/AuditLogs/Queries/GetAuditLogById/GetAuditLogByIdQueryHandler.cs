using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Enums;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetAuditLogById
{
    public class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, Result<AuditLogDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICacheService _cacheService;

        public GetAuditLogByIdQueryHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            ICurrentUserService currentUserService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _currentUserService = currentUserService;
            _cacheService = cacheService;
        }

        public async Task<Result<AuditLogDto>> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                var isAdmin = await _currentUserService.IsInRoleAsync(EUserRoles.Admin);


                var auditLog = await _unitOfWork.AuditLogs.GetByIdWithIncludeAsync(request.Id,
                    query => query.Include(entity => entity.User),
                    cancellationToken);

                if (auditLog == null)
                {
                    return Result<AuditLogDto>.NotFound("Audit log không tồn tại");
                }

                // Kiểm tra quyền truy cập
                if (!isAdmin && auditLog.UserId != currentUserId)
                {
                    return Result<AuditLogDto>.Forbidden("Bạn không có quyền truy cập audit log này");
                }

                var auditLogDto = new AuditLogDto
                {
                    Id = auditLog.Id,
                    EntityName = auditLog.EntityName,
                    ActionType = auditLog.ActionType,
                    OldValues = auditLog.OldValues,
                    NewValues = auditLog.NewValues,
                    CreatedAt = auditLog.CreatedAt,
                    UserId = auditLog.UserId,
                    UserName = auditLog.User?.UserName ?? "System"
                };

                return Result<AuditLogDto>.Success(auditLogDto);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetAuditLogByIdQueryHandler.Handle");
                return Result<AuditLogDto>.BadRequest(ex.Message);
            }
        }
    }
}

