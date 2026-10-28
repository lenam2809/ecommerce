using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Promotions.Commands.DeleteFlashSale
{
    public class DeleteFlashSaleCommandHandler : IRequestHandler<DeleteFlashSaleCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteFlashSaleCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(
            DeleteFlashSaleCommand request, CancellationToken cancellationToken)
        {
            var flashSale = await _unitOfWork.BaseRepository<FlashSale>()
                .GetQueryable(tracking: true)
                .Include(fs => fs.Items)
                .FirstOrDefaultAsync(fs => fs.Id == request.Id, cancellationToken);

            if (flashSale == null)
            {
                return Result<bool>.NotFound("Chiến dịch Flash Sale không tồn tại.");
            }

            _unitOfWork.BaseRepository<FlashSale>().Delete(flashSale);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}
