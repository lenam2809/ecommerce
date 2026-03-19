using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByBrandId
{
    public class DeleteCategoryBrandsByBrandIdCommandHandler : IRequestHandler<DeleteCategoryBrandsByBrandIdCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteCategoryBrandsByBrandIdCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteCategoryBrandsByBrandIdCommand request, CancellationToken cancellationToken)
        {
            var categoryBrands = await _unitOfWork.CategoryBrands
                .FindAsync(cb => cb.BrandId == request.BrandId, cancellationToken);

            if (categoryBrands.Any())
            {
                _unitOfWork.CategoryBrands.DeleteRange(categoryBrands);
                await _unitOfWork.CompleteAsync(cancellationToken);
            }

            return Result<bool>.Success(true);
        }
    }
}

