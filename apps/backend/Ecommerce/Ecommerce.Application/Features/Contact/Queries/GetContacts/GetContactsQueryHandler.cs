using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Queries.GetContacts
{
    public class GetContactsQueryHandler : IRequestHandler<GetContactsQuery, Result<List<ContactDto>>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;
        private readonly IMapper _mapper;

        public GetContactsQueryHandler(IRepository<Ecommerce.Domain.Entities.Contact> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<List<ContactDto>>> Handle(GetContactsQuery request, CancellationToken cancellationToken)
        {
            var contacts = await _repository.GetAllAsync(cancellationToken);
            return Result<List<ContactDto>>.Success(_mapper.Map<List<ContactDto>>(contacts));
        }
    }
}

