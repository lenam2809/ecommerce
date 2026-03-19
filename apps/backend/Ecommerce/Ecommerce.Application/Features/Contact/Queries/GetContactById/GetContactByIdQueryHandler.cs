using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Queries.GetContactById
{
    public class GetContactByIdQueryHandler : IRequestHandler<GetContactByIdQuery, Result<ContactDto>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;
        private readonly IMapper _mapper;

        public GetContactByIdQueryHandler(IRepository<Ecommerce.Domain.Entities.Contact> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<ContactDto>> Handle(GetContactByIdQuery request, CancellationToken cancellationToken)
        {
            var contact = await _repository.GetByIdAsync(request.Id, cancellationToken);
            return contact == null
                ? Result<ContactDto>.NotFound("Không tìm thấy phần liên hệ.")
                : Result<ContactDto>.Success(_mapper.Map<ContactDto>(contact));
        }
    }
}

