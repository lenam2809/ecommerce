using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.DeleteProduct
{
    public class DeleteProductCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
    }
}

