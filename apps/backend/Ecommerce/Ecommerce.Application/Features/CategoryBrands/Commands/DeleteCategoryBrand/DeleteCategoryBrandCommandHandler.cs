using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrand
{
    public class DeleteCategoryBrandCommandHandler : IRequestHandler<DeleteCategoryBrandCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteCategoryBrandCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteCategoryBrandCommand request, CancellationToken cancellationToken)
        {
            var categoryBrand = await _unitOfWork.CategoryBrands
                .FindAsync(cb => cb.CategoryId == request.CategoryId
                && cb.BrandId == request.BrandId, cancellationToken);

            if (categoryBrand == null)
            {
                return Result<bool>.NotFound("Liên kết CategoryBrand không tồn tại");
            }

            _unitOfWork.CategoryBrands.DeleteRange(categoryBrand);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}

