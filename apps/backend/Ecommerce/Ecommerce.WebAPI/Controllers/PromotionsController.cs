using System.Threading.Tasks;
using Ecommerce.Application.Features.Promotions.Queries.GetCurrentFlashSale;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PromotionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy thông tin chương trình Flash Sale đang hoạt động (kèm danh sách sản phẩm, giá khuyến mãi và đếm ngược)
        /// </summary>
        [HttpGet("flash-sale/current")]
        public async Task<IActionResult> GetCurrentFlashSale()
        {
            var result = await _mediator.Send(new GetCurrentFlashSaleQuery());
            return result.ToActionResult();
        }
    }
}
