using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetAuditLogs
{
    public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, Result<PaginatedList<AuditLogDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICacheService _cacheService;

        public GetAuditLogsQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            ICurrentUserService currentUserService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
            _cacheService = cacheService;
        }

        public async Task<Result<PaginatedList<AuditLogDto>>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                var isAdmin = await _currentUserService.IsInRoleAsync("Admin");

                // Xây dựng biểu thức filter
                Expression<Func<AuditLog, bool>> filter = auditLog =>
                    // Phân quyền: Admin xem tất cả, user thường chỉ xem log của mình
                    (isAdmin || auditLog.UserId == currentUserId) &&
                    // Lọc theo khoảng thời gian
                    (!request.StartDate.HasValue || auditLog.CreatedAt >= request.StartDate.Value) &&
                    (!request.EndDate.HasValue || auditLog.CreatedAt <= request.EndDate.Value) &&
                    // Lọc theo ActionType
                    (string.IsNullOrEmpty(request.ActionType) || auditLog.ActionType.Contains(request.ActionType)) &&
                    // Lọc theo EntityName
                    (string.IsNullOrEmpty(request.EntityName) || auditLog.EntityName.Contains(request.EntityName)) &&
                    // Tìm kiếm theo từ khóa
                    (string.IsNullOrEmpty(request.SearchTerm) ||
                     auditLog.EntityName.Contains(request.SearchTerm) ||
                     auditLog.ActionType.Contains(request.SearchTerm) ||
                     auditLog.OldValues.Contains(request.SearchTerm) ||
                     auditLog.NewValues.Contains(request.SearchTerm));

                // Xây dựng sắp xếp
                Func<IQueryable<AuditLog>, IOrderedQueryable<AuditLog>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "entityname" => request.IsDescending
                            ? query.OrderByDescending(a => a.EntityName)
                            : query.OrderBy(a => a.EntityName),
                        "actiontype" => request.IsDescending
                            ? query.OrderByDescending(a => a.ActionType)
                            : query.OrderBy(a => a.ActionType),
                        "createdat" => request.IsDescending
                            ? query.OrderByDescending(a => a.CreatedAt)
                            : query.OrderBy(a => a.CreatedAt),
                        _ => query.OrderByDescending(a => a.CreatedAt)
                    };
                };

                // Lấy dữ liệu phân trang
                var paginatedResult = await _unitOfWork.AuditLogs
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: a => a.Include(x => x.User) // Include User để lấy tên
                        );


                // Ánh xạ sang DTO
                var auditLogDtos = paginatedResult.Items.Select(auditLog => new AuditLogDto
                {
                    Id = auditLog.Id,
                    EntityName = auditLog.EntityName,
                    ActionType = auditLog.ActionType,
                    OldValues = auditLog.OldValues,
                    NewValues = auditLog.NewValues,
                    CreatedAt = auditLog.CreatedAt,
                    UserId = auditLog.UserId,
                    UserName = auditLog.User?.UserName ?? "System"
                }).ToList();

                // Tạo kết quả phân trang
                var result = new PaginatedList<AuditLogDto>(
                    auditLogDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    $"Retrieved {auditLogDtos.Count} audit logs for user {currentUserId}",
                    "GetAuditLogs");

                return Result<PaginatedList<AuditLogDto>>.Success(result);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetAuditLogsQueryHandler.Handle");
                return Result<PaginatedList<AuditLogDto>>.BadRequest(ex.Message);
            }
        }
    }
}

