using Ecommerce.Application.Features.Banners.Commands.CreateBanner;
using Ecommerce.Application.Features.Banners.Commands.DeleteBanner;
using Ecommerce.Application.Features.Banners.Commands.UpdateBanner;
using Ecommerce.Application.Features.Banners.Queries.GetBannerById;
using Ecommerce.Application.Features.Banners.Queries.GetBanners;
using Ecommerce.Application.Features.Banners.Queries.GetPaged;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BannerController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BannerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách tất cả các banner
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetBannersQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tất cả các brand theo phân trang
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] GetPagedBannerQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thông tin của một banner theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetBannerByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Thêm mới một banner
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateBannerCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
                ? CreatedAtAction(nameof(GetById), new { id = result.Value }, new { Success = true, Id = result.Value })
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin của một banner
        /// </summary>
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateBannerCommand command)
        {
            if (id != command.Id)
                return BadRequest(new { Success = false, Message = "ID không hợp lệ." });

            var result = await _mediator.Send(command);
            return result.IsSuccess ? NoContent() : result.ToActionResult();
        }

        /// <summary>
        /// Xóa một banner theo ID
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteBannerCommand { Id = id });
            return result.ToActionResult();
        }
    }
}

