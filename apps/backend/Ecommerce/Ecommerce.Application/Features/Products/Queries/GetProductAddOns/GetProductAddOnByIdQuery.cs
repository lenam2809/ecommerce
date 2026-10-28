using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductAddOns
{
    public class GetProductAddOnByIdQuery : IRequest<Result<ProductAddOnDto>>
    {
        public Guid Id { get; set; }
    }
}
