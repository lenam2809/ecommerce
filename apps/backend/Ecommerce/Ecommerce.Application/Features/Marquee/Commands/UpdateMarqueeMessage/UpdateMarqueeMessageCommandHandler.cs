using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ganss.Xss;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ecommerce.Application.Features.Marquee.Commands.UpdateMarqueeMessage
{
    public class UpdateMarqueeMessageCommandHandler : IRequestHandler<UpdateMarqueeMessageCommand, Result<bool>>
    {
        private readonly IMarqueeRepository _repo;
        private readonly ICacheService _cache;
        private readonly IHttpContextAccessor _httpCtx;

        public UpdateMarqueeMessageCommandHandler(
            IMarqueeRepository repo,
            ICacheService cache,
            IHttpContextAccessor httpCtx)
        {
            _repo = repo;
            _cache = cache;
            _httpCtx = httpCtx;
        }

        public async Task<Result<bool>> Handle(UpdateMarqueeMessageCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var message = await _repo.GetByIdAsync(request.Id, cancellationToken);
                if (message is null)
                    return Result<bool>.NotFound("Không tìm thấy tin nhắn marquee.");

                var oldData = JsonSerializer.Serialize(new
                {
                    message.Content, message.Speed, message.Priority,
                    message.IsActive, message.LinkUrl, message.Icon,
                    message.StartDate, message.EndDate
                });

                var sanitizer = new HtmlSanitizer();
                message.Content = sanitizer.Sanitize(request.Content);
                message.LinkUrl = request.LinkUrl;
                message.Icon = request.Icon;
                message.Speed = request.Speed;
                message.Priority = request.Priority;
                message.IsActive = request.IsActive;
                message.StartDate = request.StartDate;
                message.EndDate = request.EndDate;
                message.UpdatedAt = DateTime.UtcNow;

                _repo.Update(message);

                await _repo.AddAuditLogAsync(new MarqueeAuditLog
                {
                    Action = "Update",
                    OldData = oldData,
                    NewData = JsonSerializer.Serialize(new
                    {
                        message.Content, message.Speed, message.Priority,
                        message.IsActive, message.LinkUrl, message.Icon,
                        message.StartDate, message.EndDate
                    }),
                    ChangedBy = _httpCtx.HttpContext?.User?.Identity?.Name ?? "system"
                }, cancellationToken);

                await _repo.SaveChangesAsync(cancellationToken);
                await _cache.RemoveAsync(CacheKeys.GetPublicMarquee());

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}
