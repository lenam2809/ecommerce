using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.DeleteShowroom
{
    public class DeleteShowroomCommandHandler : IRequestHandler<DeleteShowroomCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteShowroomCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteShowroomCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var showroom = await _unitOfWork.BaseRepository<Showroom>()
                    .GetByIdAsync(request.Id, cancellationToken);

                if (showroom == null)
                {
                    return Result<bool>.NotFound($"Không tìm thấy Showroom với Id: {request.Id}");
                }

                // Xóa mềm: đánh dấu IsActive = false
                showroom.IsActive = false;
                _unitOfWork.BaseRepository<Showroom>().Update(showroom);
                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest($"Lỗi khi xóa showroom: {ex.Message}");
            }
        }
    }
}
