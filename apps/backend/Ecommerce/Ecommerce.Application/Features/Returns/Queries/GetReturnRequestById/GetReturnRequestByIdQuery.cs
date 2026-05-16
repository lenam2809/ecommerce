using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequestById
{
    public class GetReturnRequestByIdQuery : IQuery<Result<ReturnRequestDto>>
    {
        public Guid Id { get; set; }
    }
}
