using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces.Base;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Commands.DeleteContact
{
    public record DeleteContactCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; init; }
    }

    public class DeleteContactCommandHandler : IRequestHandler<DeleteContactCommand, Result<bool>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;

        public DeleteContactCommandHandler(IRepository<Ecommerce.Domain.Entities.Contact> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteContactCommand request, CancellationToken cancellationToken)
        {
            var contact = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (contact == null)
                return Result<bool>.NotFound("Không tìm thấy phần liên hệ.");

            _repository.Delete(contact);
            await _repository.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
    }
}

