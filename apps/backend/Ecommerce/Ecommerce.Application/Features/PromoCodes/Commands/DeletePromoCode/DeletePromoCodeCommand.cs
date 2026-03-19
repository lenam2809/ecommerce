using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Commands.DeletePromoCode
{
    public class DeletePromoCodeCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}

