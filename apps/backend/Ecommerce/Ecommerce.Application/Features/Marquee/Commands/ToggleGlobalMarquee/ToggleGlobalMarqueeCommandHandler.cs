using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ecommerce.Application.Features.Marquee.Commands.ToggleGlobalMarquee
{
    public class ToggleGlobalMarqueeCommandHandler : IRequestHandler<ToggleGlobalMarqueeCommand, Result<bool>>
    {
        private readonly IMarqueeRepository _repo;
        private readonly ICacheService _cache;
        private readonly IHttpContextAccessor _httpCtx;

        public ToggleGlobalMarqueeCommandHandler(
            IMarqueeRepository repo,
            ICacheService cache,
            IHttpContextAccessor httpCtx)
        {
            _repo = repo;
            _cache = cache;
            _httpCtx = httpCtx;
        }

        public async Task<Result<bool>> Handle(ToggleGlobalMarqueeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var setting = await _repo.GetSettingAsync(cancellationToken)
                    ?? new MarqueeSetting { Id = 1, IsEnabled = true };

                var oldEnabled = setting.IsEnabled;
                setting.IsEnabled = !setting.IsEnabled;

                await _repo.SaveSettingAsync(setting, cancellationToken);

                await _repo.AddAuditLogAsync(new MarqueeAuditLog
                {
                    Action = "ToggleGlobal",
                    OldData = JsonSerializer.Serialize(new { IsEnabled = oldEnabled }),
                    NewData = JsonSerializer.Serialize(new { setting.IsEnabled }),
                    ChangedBy = _httpCtx.HttpContext?.User?.Identity?.Name ?? "system"
                }, cancellationToken);

                await _repo.SaveChangesAsync(cancellationToken);
                await _cache.RemoveAsync(CacheKeys.GetPublicMarquee());

                return Result<bool>.Success(setting.IsEnabled);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}
