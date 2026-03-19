using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Queries.GetContactById
{
    public class GetContactByIdQuery : IRequest<Result<ContactDto>>
    {
        public Guid Id { get; set; }
    }
}

