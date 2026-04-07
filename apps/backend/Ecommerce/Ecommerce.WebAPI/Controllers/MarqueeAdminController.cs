using Ecommerce.Application.Features.Marquee.Commands.CreateMarqueeMessage;
using Ecommerce.Application.Features.Marquee.Commands.DeleteMarqueeMessage;
using Ecommerce.Application.Features.Marquee.Commands.ToggleGlobalMarquee;
using Ecommerce.Application.Features.Marquee.Commands.ToggleMarqueeMessage;
using Ecommerce.Application.Features.Marquee.Commands.UpdateMarqueeMessage;
using Ecommerce.Application.Features.Marquee.Queries.GetAllMarqueeAdmin;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/admin/marquee")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class MarqueeAdminController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MarqueeAdminController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách marquee (dành cho admin)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllMarqueeAdminQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách marquee theo phân trang (dành cho admin)
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] Ecommerce.Application.Features.Marquee.Queries.GetPagedMarqueeAdmin.GetPagedMarqueeAdminQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Tạo tin nhắn marquee mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMarqueeMessageCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
                ? CreatedAtAction(nameof(GetAll), new { }, new { Success = true, Id = result.Value })
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật tin nhắn marquee
        /// </summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMarqueeMessageCommand command)
        {
            if (id != command.Id)
                return BadRequest(new { Success = false, Message = "ID không hợp lệ." });

            var result = await _mediator.Send(command);
            return result.IsSuccess ? NoContent() : result.ToActionResult();
        }

        /// <summary>
        /// Xóa tin nhắn marquee
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteMarqueeMessageCommand { Id = id });
            return result.IsSuccess ? NoContent() : result.ToActionResult();
        }

        /// <summary>
        /// Bật/tắt một tin nhắn marquee
        /// </summary>
        [HttpPatch("{id:guid}/toggle")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            var result = await _mediator.Send(new ToggleMarqueeMessageCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Bật/tắt toàn bộ thanh marquee
        /// </summary>
        [HttpPatch("toggle-global")]
        public async Task<IActionResult> ToggleGlobal()
        {
            var result = await _mediator.Send(new ToggleGlobalMarqueeCommand());
            return result.ToActionResult();
        }
    }
}
