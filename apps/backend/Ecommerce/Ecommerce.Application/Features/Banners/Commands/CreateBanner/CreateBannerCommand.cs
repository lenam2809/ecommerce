using Ecommerce.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Banners.Commands.CreateBanner
{
    public class CreateBannerCommand : IRequest<Result<Guid>>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public required IFormFile Image { get; set; }
        public string ButtonText { get; set; } = string.Empty;
        public string ButtonLink { get; set; } = string.Empty;
        public bool IsActive { get; set; }

    }
}

