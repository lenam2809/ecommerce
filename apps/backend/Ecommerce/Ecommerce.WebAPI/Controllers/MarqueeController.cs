using Ecommerce.Application.Features.Marquee.Queries.GetPublicMarquee;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/marquee")]
    [ApiController]
    public class MarqueeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MarqueeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy thông tin marquee công khai (có cache 5 phút)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPublic()
        {
            var result = await _mediator.Send(new GetPublicMarqueeQuery());
            return result.ToActionResult();
        }
    }
}
