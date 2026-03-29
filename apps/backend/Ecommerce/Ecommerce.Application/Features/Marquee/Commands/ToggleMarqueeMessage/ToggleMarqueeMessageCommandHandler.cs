using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ecommerce.Application.Features.Marquee.Commands.ToggleMarqueeMessage
{
    public class ToggleMarqueeMessageCommandHandler : IRequestHandler<ToggleMarqueeMessageCommand, Result<bool>>
    {
        private readonly IMarqueeRepository _repo;
        private readonly ICacheService _cache;
        private readonly IHttpContextAccessor _httpCtx;

        public ToggleMarqueeMessageCommandHandler(
            IMarqueeRepository repo,
            ICacheService cache,
            IHttpContextAccessor httpCtx)
        {
            _repo = repo;
            _cache = cache;
            _httpCtx = httpCtx;
        }

        public async Task<Result<bool>> Handle(ToggleMarqueeMessageCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var message = await _repo.GetByIdAsync(request.Id, cancellationToken);
                if (message is null)
                    return Result<bool>.NotFound("Không tìm thấy tin nhắn marquee.");

                var oldIsActive = message.IsActive;
                message.IsActive = !message.IsActive;
                message.UpdatedAt = DateTime.UtcNow;
                _repo.Update(message);

                await _repo.AddAuditLogAsync(new MarqueeAuditLog
                {
                    Action = "Toggle",
                    OldData = JsonSerializer.Serialize(new { IsActive = oldIsActive }),
                    NewData = JsonSerializer.Serialize(new { message.IsActive }),
                    ChangedBy = _httpCtx.HttpContext?.User?.Identity?.Name ?? "system"
                }, cancellationToken);

                await _repo.SaveChangesAsync(cancellationToken);
                await _cache.RemoveAsync(CacheKeys.GetPublicMarquee());

                return Result<bool>.Success(message.IsActive);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}
