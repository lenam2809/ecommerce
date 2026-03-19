using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand
{
    public class CreateCategoryBrandCommandHandler : IRequestHandler<CreateCategoryBrandCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateCategoryBrandCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateCategoryBrandCommand request, CancellationToken cancellationToken)
        {
            var categoryBrand = new CategoryBrand
            {
                CategoryId = request.CategoryId,
                BrandId = request.BrandId,
                LinkedAt = DateTime.Now
            };

            await _unitOfWork.CategoryBrands.AddAsync(categoryBrand, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}

