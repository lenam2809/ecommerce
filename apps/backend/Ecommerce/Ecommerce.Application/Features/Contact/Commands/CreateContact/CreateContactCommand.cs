using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Commands.CreateContact
{
    public record CreateContactCommand(
        ContactInfoDto Phone,
        ContactInfoDto Email,
        ContactInfoDto Office,
        List<SocialLinkDto> SocialLinks,
        List<FaqItemDto> Faqs
    ) : IRequest<Result<Guid>>;

    public class CreateContactCommandHandler : IRequestHandler<CreateContactCommand, Result<Guid>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;
        private readonly IMapper _mapper;

        public CreateContactCommandHandler(IRepository<Ecommerce.Domain.Entities.Contact> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<Guid>> Handle(CreateContactCommand request, CancellationToken cancellationToken)
        {
            var contact = new Ecommerce.Domain.Entities.Contact
            {
                Phone = _mapper.Map<ContactInfo>(request.Phone),
                Email = _mapper.Map<ContactInfo>(request.Email),
                Office = _mapper.Map<ContactInfo>(request.Office),
                SocialLinks = _mapper.Map<List<SocialLink>>(request.SocialLinks),
                Faqs = _mapper.Map<List<FaqItem>>(request.Faqs),
            };

            contact.Id = Guid.NewGuid();

            await _repository.AddAsync(contact, cancellationToken);
            return Result<Guid>.Success(contact.Id);
        }
    }
}

