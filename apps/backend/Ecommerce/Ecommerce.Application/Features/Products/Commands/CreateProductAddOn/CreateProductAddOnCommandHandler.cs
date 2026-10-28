using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Products.Commands.CreateProductAddOn
{
    [Authorize(Policy = EPermissions.CreateProduct)]
    public class CreateProductAddOnCommandHandler : IRequestHandler<CreateProductAddOnCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public CreateProductAddOnCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<Guid>> Handle(CreateProductAddOnCommand request, CancellationToken cancellationToken)
        {
            var addOn = _mapper.Map<ProductAddOn>(request);

            var repository = _unitOfWork.BaseRepository<ProductAddOn>();
            var created = await repository.AddAsync(addOn, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(
                ELogLevel.Information,
                "ProductAddOn {AddOnCode} created successfully with ID {AddOnId}",
                "CreateProductAddOn",
                properties: new Dictionary<string, object?>
                {
                    { "AddOnId", created.Id },
                    { "AddOnCode", created.Code },
                    { "Price", created.Price }
                });

            return Result<Guid>.Success(created.Id);
        }
    }
}
