using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.DeleteProductAddOn
{
    public class DeleteProductAddOnCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
    }
}
