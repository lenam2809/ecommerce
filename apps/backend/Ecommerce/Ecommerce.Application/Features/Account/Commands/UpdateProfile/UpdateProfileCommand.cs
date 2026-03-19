using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Account.Commands.UpdateProfile
{
    /// <summary>
    /// Command để cập nhật thông tin cá nhân của người dùng
    /// </summary>
    public class UpdateProfileCommand : IRequest<Result<bool>>, IMapFrom<ApplicationUser>
    {
        /// <summary>
        /// Tên của người dùng
        /// </summary>
        public required string FirstName { get; set; }

        /// <summary>
        /// Họ của người dùng
        /// </summary>
        public required string LastName { get; set; }

        /// <summary>
        /// Số điện thoại của người dùng
        /// </summary>
        public required string PhoneNumber { get; set; }

        /// <summary>
        /// URL ảnh đại diện của người dùng
        /// </summary>
        public string? AvatarUrl { get; set; }

        /// <summary>
        /// Cấu hình mapping từ Command sang entity ApplicationUser
        /// </summary>
        public void Mapping(Profile profile)
        {
            profile.CreateMap<UpdateProfileCommand, ApplicationUser>()
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.AvatarUrl));
        }
    }
}

