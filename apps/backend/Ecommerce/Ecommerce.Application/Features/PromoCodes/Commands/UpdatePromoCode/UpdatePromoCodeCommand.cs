using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode
{
    public class UpdatePromoCodeCommand : ICommand<Result<bool>>
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Description { get; set; }
        public required string Type { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool FreeShipping { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int UsageLimit { get; set; }
        public bool IsActive { get; set; }
    }
}

