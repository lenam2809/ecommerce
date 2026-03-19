using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Queries.GetAboutById;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.UpdateAboutStatus
{
    public class UpdateAboutStatusCommandHandler : IRequestHandler<UpdateAboutStatusCommand, Result<bool>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateAboutStatusCommandHandler(
            IRepository<Ecommerce.Domain.Entities.About> repository,
            ICacheInvalidationService cacheInvalidationService,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _cacheInvalidationService = cacheInvalidationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateAboutStatusCommand request, CancellationToken cancellationToken)
        {
            var about = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (about == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy About với ID {request.Id}");
            }

            // Nếu cập nhật trạng thái thành active
            if (request.IsActive)
            {
                // Đặt tất cả các bản ghi khác về false
                var allActiveAbouts = await _repository.FindAsync(a => a.IsActive && a.Id != request.Id, cancellationToken);

                foreach (var activeAbout in allActiveAbouts)
                {
                    activeAbout.IsActive = false;
                    _repository.Update(activeAbout);
                }
            }

            // Cập nhật trạng thái cho bản ghi hiện tại
            about.IsActive = request.IsActive;
            _repository.Update(about);

            await _unitOfWork.CompleteAsync(cancellationToken);

            // Xóa cache liên quan
            await _cacheInvalidationService.InvalidateAboutCache(request.Id);

            return Result<bool>.Success(true);
        }
    }
}

