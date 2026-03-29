using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ganss.Xss;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ecommerce.Application.Features.Marquee.Commands.CreateMarqueeMessage
{
    public class CreateMarqueeMessageCommandHandler : IRequestHandler<CreateMarqueeMessageCommand, Result<Guid>>
    {
        private readonly IMarqueeRepository _repo;
        private readonly ICacheService _cache;
        private readonly IHttpContextAccessor _httpCtx;

        public CreateMarqueeMessageCommandHandler(
            IMarqueeRepository repo,
            ICacheService cache,
            IHttpContextAccessor httpCtx)
        {
            _repo = repo;
            _cache = cache;
            _httpCtx = httpCtx;
        }

        public async Task<Result<Guid>> Handle(CreateMarqueeMessageCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var sanitizer = new HtmlSanitizer();
                var message = new MarqueeMessage
                {
                    Content = sanitizer.Sanitize(request.Content),
                    LinkUrl = request.LinkUrl,
                    Icon = request.Icon,
                    Speed = request.Speed,
                    Priority = request.Priority,
                    IsActive = request.IsActive,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate
                };

                await _repo.AddAsync(message, cancellationToken);

                await _repo.AddAuditLogAsync(new MarqueeAuditLog
                {
                    Action = "Create",
                    NewData = JsonSerializer.Serialize(new { message.Content, message.Speed, message.Priority, message.IsActive }),
                    ChangedBy = _httpCtx.HttpContext?.User?.Identity?.Name ?? "system"
                }, cancellationToken);

                await _repo.SaveChangesAsync(cancellationToken);
                await _cache.RemoveAsync(CacheKeys.GetPublicMarquee());

                return Result<Guid>.Success(message.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.BadRequest(ex.Message);
            }
        }
    }
}
