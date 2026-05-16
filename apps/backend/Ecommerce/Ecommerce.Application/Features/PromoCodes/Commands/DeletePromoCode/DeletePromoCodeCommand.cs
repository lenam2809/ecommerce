using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.PromoCodes.Commands.DeletePromoCode
{
    public class DeletePromoCodeCommand : ICommand<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}

