using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Commands.ApplyPromoCode;
using Ecommerce.Application.Features.PromoCodes.Commands.CreatePromoCode;
using Ecommerce.Application.Features.PromoCodes.Commands.DeletePromoCode;
using Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode;
using Ecommerce.Application.Features.PromoCodes.Queries.GetActivePromoCodes;
using Ecommerce.Application.Features.PromoCodes.Queries.GetPagedPromoCodes;
using Ecommerce.Application.Features.PromoCodes.Queries.GetPromoCodeById;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/promo-codes")]
    [ApiController]
    public class PromoCodesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PromoCodesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] GetPagedPromoCodesQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetPromoCodeByIdQuery { Id = id });
            return result.ToActionResult();
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActivePromoCodes()
        {
            var result = await _mediator.Send(new GetActivePromoCodesQuery());
            return result.ToActionResult();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePromoCodeCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
                ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
                : result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePromoCodeCommand command)
        {
            if (id != command.Id)
                return Result<Unit>.BadRequest("ID trong URL phải khớp với ID trong dữ liệu").ToActionResult();

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeletePromoCodeCommand { Id = id });
            return result.ToActionResult();
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplyPromoCode([FromBody] ApplyPromoCodeCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }
}

