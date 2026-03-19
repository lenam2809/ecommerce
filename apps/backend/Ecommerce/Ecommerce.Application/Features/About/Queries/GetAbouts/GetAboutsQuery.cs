using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using MediatR;

namespace Ecommerce.Application.Features.About.Queries.GetAbouts
{
    public record GetAboutsQuery : IRequest<Result<List<AboutDto>>>;
}

