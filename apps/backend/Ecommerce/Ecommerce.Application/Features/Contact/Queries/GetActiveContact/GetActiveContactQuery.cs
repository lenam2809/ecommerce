using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Queries.GetActiveContact
{
    [Cacheable(CacheKeys.ContactActive, ECachePolicy.Long)]
    public record GetActiveContactQuery : IRequest<Result<ContactDto>>;

}

