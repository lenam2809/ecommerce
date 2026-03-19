using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Commands.UpdateContact
{
    public record UpdateContactCommand(
        Guid Id,
        ContactInfoDto Phone,
        ContactInfoDto Email,
        ContactInfoDto Office,
        List<SocialLinkDto> SocialLinks,
        List<FaqItemDto> Faqs
    ) : IRequest<Result<bool>>;

    public class UpdateContactCommandHandler : IRequestHandler<UpdateContactCommand, Result<bool>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;
        private readonly IMapper _mapper;

        public UpdateContactCommandHandler(IRepository<Ecommerce.Domain.Entities.Contact> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<bool>> Handle(UpdateContactCommand request, CancellationToken cancellationToken)
        {
            var existingContact = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (existingContact == null)
                return Result<bool>.NotFound("Không tìm thấy phần liên hệ.");

            _mapper.Map(request, existingContact);
            existingContact.UpdatedAt = DateTime.Now;

            _repository.Delete(existingContact);
            await _repository.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
    }
}

