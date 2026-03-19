using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Commands.DeleteBrand
{

    public class DeleteBrandCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}

