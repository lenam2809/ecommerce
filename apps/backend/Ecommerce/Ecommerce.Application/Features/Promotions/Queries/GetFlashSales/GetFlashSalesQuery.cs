using System.Collections.Generic;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;

namespace Ecommerce.Application.Features.Promotions.Queries.GetFlashSales
{
    public class GetFlashSalesQuery : IQuery<Result<List<FlashSaleDto>>>
    {
        public bool? IsActive { get; set; }
    }
}
