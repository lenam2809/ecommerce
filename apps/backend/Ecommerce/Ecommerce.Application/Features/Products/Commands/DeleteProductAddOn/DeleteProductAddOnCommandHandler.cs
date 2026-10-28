using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Products.Commands.DeleteProductAddOn
{
    [Authorize(Policy = EPermissions.DeleteProduct)]
    public class DeleteProductAddOnCommandHandler : IRequestHandler<DeleteProductAddOnCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public DeleteProductAddOnCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Unit>> Handle(DeleteProductAddOnCommand request, CancellationToken cancellationToken)
        {
            var repository = _unitOfWork.BaseRepository<ProductAddOn>();
            var existing = await repository.GetByIdAsync(request.Id, cancellationToken);

            if (existing == null)
            {
                return Result<Unit>.NotFound($"Không tìm thấy gói dịch vụ với ID: {request.Id}");
            }

            repository.Delete(existing);
            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(
                ELogLevel.Information,
                "ProductAddOn {AddOnId} ({Code}) deleted successfully",
                "DeleteProductAddOn",
                properties: new Dictionary<string, object?>
                {
                    { "AddOnId", existing.Id },
                    { "Code", existing.Code }
                });

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
