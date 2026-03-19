using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Account.Commands.UpdateProfile;
using Ecommerce.Application.Features.Auth.Queries.GetProfile;
using Ecommerce.Application.Features.Users.Commands.ChangePassword;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileService;

        public AccountController(IMediator mediator, IFileStorageService fileService)
        {
            _mediator = mediator;
            _fileService = fileService;
        }

        /// <summary>
        /// Lấy thông tin cá nhân của người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var result = await _mediator.Send(new GetProfileQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin cá nhân
        /// </summary>
        [HttpPut]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequest request)
        {
            string avatarUrl = null;
            if (request.Avatar != null)
            {
                avatarUrl = await _fileService.SaveFileAsync(request.Avatar, "users");
            }

            var command = new UpdateProfileCommand
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                AvatarUrl = avatarUrl
            };

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Thay đổi mật khẩu
        /// </summary>
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
        {
            command.UserId = User.GetUserId();
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }

    public class UpdateProfileRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public IFormFile? Avatar { get; set; }
    }
}

