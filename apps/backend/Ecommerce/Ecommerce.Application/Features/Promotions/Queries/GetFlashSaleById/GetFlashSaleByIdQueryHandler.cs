using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Application.Features.Promotions.Helpers;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Promotions.Queries.GetFlashSaleById
{
    public class GetFlashSaleByIdQueryHandler : IRequestHandler<GetFlashSaleByIdQuery, Result<FlashSaleDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetFlashSaleByIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<FlashSaleDto>> Handle(
            GetFlashSaleByIdQuery request, CancellationToken cancellationToken)
        {
            var flashSale = await _unitOfWork.BaseRepository<FlashSale>()
                .GetQueryable()
                .AsNoTracking()
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Specifications)
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.ProductVariantSku)
                .FirstOrDefaultAsync(fs => fs.Id == request.Id, cancellationToken);

            if (flashSale == null)
            {
                return Result<FlashSaleDto>.NotFound("Chiến dịch Flash Sale không tồn tại.");
            }

            return Result<FlashSaleDto>.Success(FlashSaleMapping.ToDto(flashSale));
        }
    }
}
