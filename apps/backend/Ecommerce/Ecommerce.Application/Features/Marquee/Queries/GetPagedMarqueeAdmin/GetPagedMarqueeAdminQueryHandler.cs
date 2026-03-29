using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Marquee.DTOs;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Marquee.Queries.GetPagedMarqueeAdmin
{
    public class GetPagedMarqueeAdminQueryHandler : IRequestHandler<GetPagedMarqueeAdminQuery, Result<PaginatedList<MarqueeMessageAdminDto>>>
    {
        private readonly IMarqueeRepository _repo;
        private readonly IEnhancedLogger _logger;

        public GetPagedMarqueeAdminQueryHandler(IMarqueeRepository repo, IEnhancedLogger logger)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<PaginatedList<MarqueeMessageAdminDto>>> Handle(GetPagedMarqueeAdminQuery request, CancellationToken cancellationToken)
        {
            try
            {
                Expression<Func<MarqueeMessage, bool>> filter = m =>
                    !m.IsDeleted &&
                    (string.IsNullOrEmpty(request.SearchTerm) || m.Content.Contains(request.SearchTerm)) &&
                    (!request.IsActive.HasValue || m.IsActive == request.IsActive.Value);

                Func<IQueryable<MarqueeMessage>, IOrderedQueryable<MarqueeMessage>> orderBy = query =>
                {
                    return request.SortBy?.ToLower() switch
                    {
                        "priority" => request.IsDescending
                           ? query.OrderByDescending(c => c.Priority)
                           : query.OrderBy(c => c.Priority),
                        "content" => request.IsDescending
                            ? query.OrderByDescending(c => c.Content)
                            : query.OrderBy(c => c.Content),
                        "createdat" => request.IsDescending
                            ? query.OrderByDescending(c => c.CreatedAt)
                            : query.OrderBy(c => c.CreatedAt),
                        _ => query.OrderBy(c => c.Id)
                    };
                };

                var paginatedResult = await _repo.GetPaginatedAsync(
                    filter: filter,
                    orderBy: orderBy,
                    pageIndex: request.PageNumber,
                    pageSize: request.PageSize,
                    cancellationToken: cancellationToken
                );

                var dtos = paginatedResult.Items.Select(m => new MarqueeMessageAdminDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    LinkUrl = m.LinkUrl,
                    Icon = m.Icon,
                    Speed = m.Speed,
                    Priority = m.Priority,
                    IsActive = m.IsActive,
                    StartDate = m.StartDate,
                    EndDate = m.EndDate,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt
                }).ToList();

                var result = new PaginatedList<MarqueeMessageAdminDto>(
                    dtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<MarqueeMessageAdminDto>>.Success(result);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetPagedMarqueeAdminQueryHandler.Handle");
                return Result<PaginatedList<MarqueeMessageAdminDto>>.BadRequest(ex.Message);
            }
        }
    }
}
