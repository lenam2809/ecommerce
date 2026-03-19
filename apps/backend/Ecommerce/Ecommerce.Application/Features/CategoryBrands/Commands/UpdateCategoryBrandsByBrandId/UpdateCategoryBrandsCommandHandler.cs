using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand;
using Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByBrandId;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.UpdateCategoryBrandsByBrandId
{
    public class UpdateCategoryBrandsByBrandIdCommandHandler : IRequestHandler<UpdateCategoryBrandsByBrandIdCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMediator _mediator;

        public UpdateCategoryBrandsByBrandIdCommandHandler(IUnitOfWork unitOfWork, IMediator mediator)
        {
            _unitOfWork = unitOfWork;
            _mediator = mediator;
        }

        public async Task<Result<bool>> Handle(UpdateCategoryBrandsByBrandIdCommand request, CancellationToken cancellationToken)
        {
            // Xóa tất cả liên kết cũ
            await _mediator.Send(new DeleteCategoryBrandsByBrandIdCommand
            {
                BrandId = request.BrandId
            }, cancellationToken);

            // Tạo liên kết mới
            if (request.CategoryIds?.Any() == true)
            {
                foreach (var categoryId in request.CategoryIds)
                {
                    await _mediator.Send(new CreateCategoryBrandCommand
                    {
                        BrandId = request.BrandId,
                        CategoryId = categoryId
                    }, cancellationToken);
                }
            }

            return Result<bool>.Success(true);
        }
    }
}

