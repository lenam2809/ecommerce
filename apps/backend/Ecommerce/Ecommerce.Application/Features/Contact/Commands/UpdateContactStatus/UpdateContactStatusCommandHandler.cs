using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Contact.Queries.GetContactById;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Commands.UpdateContactStatus
{
    public class UpdateContactStatusCommandHandler : IRequestHandler<UpdateContactStatusCommand, Result<bool>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.Contact> _repository;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateContactStatusCommandHandler(
            IRepository<Ecommerce.Domain.Entities.Contact> repository,
            ICacheInvalidationService cacheInvalidationService,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _cacheInvalidationService = cacheInvalidationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateContactStatusCommand request, CancellationToken cancellationToken)
        {
            var contact = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (contact == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy Contact với ID {request.Id}");
            }

            // Nếu cập nhật trạng thái thành active
            if (request.IsActive)
            {
                // Đặt tất cả các bản ghi khác về false
                var allActiveContacts = await _repository.FindAsync(c => c.IsActive && c.Id != request.Id, cancellationToken);

                foreach (var activeContact in allActiveContacts)
                {
                    activeContact.IsActive = false;
                    _repository.Update(activeContact);
                }
            }

            // Cập nhật trạng thái cho bản ghi hiện tại
            contact.IsActive = request.IsActive;
            _repository.Update(contact);

            await _unitOfWork.CompleteAsync(cancellationToken);

            // Xóa cache liên quan
            await _cacheInvalidationService.InvalidateContactCache(request.Id);

            return Result<bool>.Success(true);
        }
    }
}

