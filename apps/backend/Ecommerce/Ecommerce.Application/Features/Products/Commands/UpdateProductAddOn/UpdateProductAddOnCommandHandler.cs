using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Products.Commands.UpdateProductAddOn
{
    [Authorize(Policy = EPermissions.EditProduct)]
    public class UpdateProductAddOnCommandHandler : IRequestHandler<UpdateProductAddOnCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public UpdateProductAddOnCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Unit>> Handle(UpdateProductAddOnCommand request, CancellationToken cancellationToken)
        {
            var repository = _unitOfWork.BaseRepository<ProductAddOn>();
            var existing = await repository.GetByIdAsync(request.Id, cancellationToken);

            if (existing == null)
            {
                return Result<Unit>.NotFound($"Không tìm thấy gói dịch vụ với ID: {request.Id}");
            }

            existing.Code = request.Code;
            existing.Name = request.Name;
            existing.Description = request.Description;
            existing.AddOnType = request.AddOnType;
            existing.Price = request.Price;
            existing.OriginalPrice = request.OriginalPrice;
            existing.DurationMonths = request.DurationMonths;
            existing.IsActive = request.IsActive;
            existing.DisplayOrder = request.DisplayOrder;
            existing.ProductId = request.ProductId;
            existing.CategoryId = request.CategoryId;
            existing.BrandId = request.BrandId;

            repository.Update(existing);
            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(
                ELogLevel.Information,
                "ProductAddOn {AddOnId} updated successfully",
                "UpdateProductAddOn",
                properties: new Dictionary<string, object?>
                {
                    { "AddOnId", existing.Id },
                    { "Code", existing.Code }
                });

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
