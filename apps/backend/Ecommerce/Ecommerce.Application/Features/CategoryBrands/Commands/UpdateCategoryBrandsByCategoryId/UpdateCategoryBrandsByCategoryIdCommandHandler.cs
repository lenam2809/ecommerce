using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand;
using Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByCategoryId;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.UpdateCategoryBrands
{
    public class UpdateCategoryBrandsByCategoryIdCommandHandler : IRequestHandler<UpdateCategoryBrandsByCategoryIdCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMediator _mediator;

        public UpdateCategoryBrandsByCategoryIdCommandHandler(IUnitOfWork unitOfWork, IMediator mediator)
        {
            _unitOfWork = unitOfWork;
            _mediator = mediator;
        }

        public async Task<Result<bool>> Handle(UpdateCategoryBrandsByCategoryIdCommand request, CancellationToken cancellationToken)
        {
            // Xóa tất cả liên kết cũ
            await _mediator.Send(new DeleteCategoryBrandsByCategoryIdCommand
            {
                CategoryId = request.CategoryId
            }, cancellationToken);

            // Tạo liên kết mới
            if (request.BrandIds?.Any() == true)
            {
                foreach (var brandId in request.BrandIds)
                {
                    await _mediator.Send(new CreateCategoryBrandCommand
                    {
                        CategoryId = request.CategoryId,
                        BrandId = brandId
                    }, cancellationToken);
                }
            }

            return Result<bool>.Success(true);
        }
    }
}

