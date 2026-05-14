using Ecommerce.Application.Features.Contact.Commands.CreateContact;
using Ecommerce.Application.Features.Contact.Commands.DeleteContact;
using Ecommerce.Application.Features.Contact.Commands.UpdateContact;
using Ecommerce.Application.Features.Contact.Commands.UpdateContactStatus;
using Ecommerce.Application.Features.Contact.Queries.GetActiveContact;
using Ecommerce.Application.Features.Contact.Queries.GetContactById;
using Ecommerce.Application.Features.Contact.Queries.GetContacts;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ContactController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all contact sections
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetContactsQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Get contact section by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetContactByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Create a new contact section
        /// </summary>
        [HttpPost]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> Create([FromBody] CreateContactCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
                ? CreatedAtAction(nameof(GetById), new { id = result.Value }, new { Success = true, Id = result.Value })
                : result.ToActionResult();
        }

        /// <summary>
        /// Update a contact section
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContactCommand command)
        {
            if (id != command.Id)
                return BadRequest(new { Success = false, Message = "Invalid ID." });

            var result = await _mediator.Send(command);
            return result.IsSuccess ? NoContent() : result.ToActionResult();
        }

        /// <summary>
        /// Delete a contact section
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteContactCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Get active contact section
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var result = await _mediator.Send(new GetActiveContactQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Update contact section status
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Policy = EPermissions.EditSettings)]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] bool isActive)
        {
            var result = await _mediator.Send(new UpdateContactStatusCommand(id, isActive));
            return result.ToActionResult();
        }
    }
}

