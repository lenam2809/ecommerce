using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using MediatR;

namespace Ecommerce.Application.Features.About.Queries.GetAboutById
{
    public class GetAboutByIdQuery : IRequest<Result<AboutDto>>
    {
        public Guid Id { get; set; }
    }
}

