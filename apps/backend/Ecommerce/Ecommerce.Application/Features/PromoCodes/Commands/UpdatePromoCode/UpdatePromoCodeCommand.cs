using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode
{
    public class UpdatePromoCodeCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool FreeShipping { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int UsageLimit { get; set; }
        public bool IsActive { get; set; }
    }
}

