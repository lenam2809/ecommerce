using System;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;

namespace Ecommerce.Application.Features.Promotions.Commands.DeleteFlashSale
{
    public class DeleteFlashSaleCommand : ICommand<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}
