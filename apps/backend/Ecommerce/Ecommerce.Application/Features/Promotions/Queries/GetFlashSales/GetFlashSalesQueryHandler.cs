using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Application.Features.Promotions.Helpers;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Promotions.Queries.GetFlashSales
{
    public class GetFlashSalesQueryHandler : IRequestHandler<GetFlashSalesQuery, Result<List<FlashSaleDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetFlashSalesQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<FlashSaleDto>>> Handle(
            GetFlashSalesQuery request, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.BaseRepository<FlashSale>()
                .GetQueryable()
                .AsNoTracking()
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Specifications)
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.ProductVariantSku)
                .AsQueryable();

            if (request.IsActive.HasValue)
            {
                query = query.Where(fs => fs.IsActive == request.IsActive.Value);
            }

            var flashSales = await query
                .OrderByDescending(fs => fs.StartTime)
                .ThenByDescending(fs => fs.Priority)
                .ToListAsync(cancellationToken);

            var dtos = flashSales
                .Select(fs => FlashSaleMapping.ToDto(fs))
                .ToList();

            return Result<List<FlashSaleDto>>.Success(dtos);
        }
    }
}
