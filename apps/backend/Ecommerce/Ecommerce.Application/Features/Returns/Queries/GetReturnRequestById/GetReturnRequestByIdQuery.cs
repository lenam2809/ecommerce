using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequestById
{
    public class GetReturnRequestByIdQuery : IRequest<Result<ReturnRequestDto>>
    {
        public Guid Id { get; set; }
    }
}
