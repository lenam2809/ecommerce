using System;
using System.Collections.Generic;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;

namespace Ecommerce.Application.Features.Promotions.Commands.CreateFlashSale
{
    public class CreateFlashSaleCommand : ICommand<Result<FlashSaleDto>>
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? BannerImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0;
        public List<FlashSaleItemInputDto> Items { get; set; } = new();
    }
}
