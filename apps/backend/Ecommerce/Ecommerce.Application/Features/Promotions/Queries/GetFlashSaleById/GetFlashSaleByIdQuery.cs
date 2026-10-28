using System;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;

namespace Ecommerce.Application.Features.Promotions.Queries.GetFlashSaleById
{
    public class GetFlashSaleByIdQuery : IQuery<Result<FlashSaleDto>>
    {
        public Guid Id { get; set; }
    }
}
