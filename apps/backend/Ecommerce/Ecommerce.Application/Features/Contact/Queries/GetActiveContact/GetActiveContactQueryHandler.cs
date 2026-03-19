using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Queries.GetActiveContact
{
    public class GetActiveContactQueryHandler : IRequestHandler<GetActiveContactQuery, Result<ContactDto>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;
        private readonly IMapper _mapper;

        public GetActiveContactQueryHandler(
            IRepository<Ecommerce.Domain.Entities.Contact> repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<ContactDto>> Handle(GetActiveContactQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var contact = await _repository.FirstOrDefaultAsync(c => c.IsActive, cancellationToken);

                if (contact == null)
                {
                    return Result<ContactDto>.NotFound("Không tìm thấy thông tin liên hệ đang hoạt động");
                }

                var result = _mapper.Map<ContactDto>(contact);

                return Result<ContactDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<ContactDto>.BadRequest(ex.Message);
            }
        }
    }
}

