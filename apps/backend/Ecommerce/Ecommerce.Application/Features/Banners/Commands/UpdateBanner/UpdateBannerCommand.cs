using Ecommerce.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Banners.Commands.UpdateBanner
{
    public class UpdateBannerCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }

        public string ButtonText { get; set; } = string.Empty;
        public string ButtonLink { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}

