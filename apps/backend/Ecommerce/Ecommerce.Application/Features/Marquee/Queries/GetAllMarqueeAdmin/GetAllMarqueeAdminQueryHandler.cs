using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Marquee.DTOs;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Queries.GetAllMarqueeAdmin
{
    public class GetAllMarqueeAdminQueryHandler
        : IRequestHandler<GetAllMarqueeAdminQuery, Result<AdminMarqueeResponseDto>>
    {
        private readonly IMarqueeRepository _repo;

        public GetAllMarqueeAdminQueryHandler(IMarqueeRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<AdminMarqueeResponseDto>> Handle(
            GetAllMarqueeAdminQuery request, CancellationToken cancellationToken)
        {
            var setting = await _repo.GetSettingAsync(cancellationToken);
            var messages = await _repo.FilterAsync(
                m => !m.IsDeleted,
                q => q.OrderBy(m => m.Priority),
                cancellationToken);

            var response = new AdminMarqueeResponseDto
            {
                IsEnabled = setting?.IsEnabled ?? true,
                Messages = messages.Select(m => new MarqueeMessageAdminDto
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
                }).ToList()
            };

            return Result<AdminMarqueeResponseDto>.Success(response);
        }
    }
}
