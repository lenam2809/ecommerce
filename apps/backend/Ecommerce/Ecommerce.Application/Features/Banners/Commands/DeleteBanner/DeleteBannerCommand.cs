using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Commands.DeleteBanner
{

    public class DeleteBannerCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}

