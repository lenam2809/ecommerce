using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByCategoryId
{
    public class DeleteCategoryBrandsByCategoryIdCommandHandler : IRequestHandler<DeleteCategoryBrandsByCategoryIdCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteCategoryBrandsByCategoryIdCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteCategoryBrandsByCategoryIdCommand request, CancellationToken cancellationToken)
        {
            var categoryBrands = await _unitOfWork.CategoryBrands
                .FindAsync(cb => cb.CategoryId == request.CategoryId, cancellationToken);

            if (categoryBrands.Any())
            {
                _unitOfWork.CategoryBrands.DeleteRange(categoryBrands);
                await _unitOfWork.CompleteAsync(cancellationToken);
            }

            return Result<bool>.Success(true);
        }
    }
}

