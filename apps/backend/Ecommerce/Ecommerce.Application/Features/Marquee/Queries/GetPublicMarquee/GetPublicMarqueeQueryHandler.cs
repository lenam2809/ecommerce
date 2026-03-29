using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Marquee.DTOs;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Queries.GetPublicMarquee
{
    public class GetPublicMarqueeQueryHandler
        : IRequestHandler<GetPublicMarqueeQuery, Result<PublicMarqueeResponseDto>>
    {
        private readonly IMarqueeRepository _repo;
        private readonly ICacheService _cache;

        public GetPublicMarqueeQueryHandler(IMarqueeRepository repo, ICacheService cache)
        {
            _repo = repo;
            _cache = cache;
        }

        public async Task<Result<PublicMarqueeResponseDto>> Handle(
            GetPublicMarqueeQuery request, CancellationToken cancellationToken)
        {
            var cached = await _cache.GetAsync<PublicMarqueeResponseDto>(CacheKeys.GetPublicMarquee());
            if (cached is not null)
                return Result<PublicMarqueeResponseDto>.Success(cached);

            var setting = await _repo.GetSettingAsync(cancellationToken);
            var isEnabled = setting?.IsEnabled ?? true;

            var now = DateTime.UtcNow;
            var messages = await _repo.FilterAsync(
                m => m.IsActive && !m.IsDeleted
                     && (m.StartDate == null || m.StartDate <= now)
                     && (m.EndDate == null || m.EndDate >= now),
                q => q.OrderBy(m => m.Priority),
                cancellationToken);

            var response = new PublicMarqueeResponseDto
            {
                IsEnabled = isEnabled,
                Messages = messages.Select(m => new MarqueeMessagePublicDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    LinkUrl = m.LinkUrl,
                    Icon = m.Icon,
                    Speed = m.Speed
                }).ToList()
            };

            await _cache.SetAsync(CacheKeys.GetPublicMarquee(), response, TimeSpan.FromMinutes(5));
            return Result<PublicMarqueeResponseDto>.Success(response);
        }
    }
}
