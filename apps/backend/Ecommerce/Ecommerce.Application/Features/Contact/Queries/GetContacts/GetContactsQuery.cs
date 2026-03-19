using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Queries.GetContacts
{
    public record GetContactsQuery : IRequest<Result<List<ContactDto>>>;
}

