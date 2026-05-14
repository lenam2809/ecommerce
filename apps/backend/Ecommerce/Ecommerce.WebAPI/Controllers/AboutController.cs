using Ecommerce.Application.Features.About.Commands.CreateAbout;
using Ecommerce.Application.Features.About.Commands.DeleteAbout;
using Ecommerce.Application.Features.About.Commands.UpdateAbout;
using Ecommerce.Application.Features.About.Commands.UpdateAboutStatus;
using Ecommerce.Application.Features.About.Queries.GetAboutById;
using Ecommerce.Application.Features.About.Queries.GetAbouts;
using Ecommerce.Application.Features.About.Queries.GetActiveAbout;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AboutController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AboutController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all about sections
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAboutsQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Get about section by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetAboutByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Create a new about section
        /// </summary>
        [HttpPost]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> Create([FromBody] CreateAboutCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
                ? CreatedAtAction(nameof(GetById), new { id = result.Value }, new { Success = true, Id = result.Value })
                : result.ToActionResult();
        }

        /// <summary>
        /// Update an about section
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAboutCommand command)
        {
            if (id != command.Id)
                return BadRequest(new { Success = false, Message = "Invalid ID." });

            var result = await _mediator.Send(command);
            return result.IsSuccess ? NoContent() : result.ToActionResult();
        }

        /// <summary>
        /// Delete an about section
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteAboutCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Get active about section
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var result = await _mediator.Send(new GetActiveAboutQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Update about section status
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] bool isActive)
        {
            var result = await _mediator.Send(new UpdateAboutStatusCommand(id, isActive));
            return result.ToActionResult();
        }
    }
}

