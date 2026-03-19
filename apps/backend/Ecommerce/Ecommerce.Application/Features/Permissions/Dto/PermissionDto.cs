using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Permissions.Dto
{
    /// <summary>
    /// DTO danh sách quyền đơn giản để hiển thị trong các dropdown hoặc checkbox list
    /// </summary>
    public class PermissionDto : IMapFrom<Permission>
    {
        /// <summary>
        /// ID của quyền
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Tên quyền
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Mô tả quyền
        /// </summary>
        public string? Description { get; set; }

        public string? Category { get; set; }


        /// <summary>
        /// Flag đánh dấu quyền đã được chọn hay chưa
        /// </summary>
        public bool IsSelected { get; set; }

        /// <summary>
        /// Cấu hình mapping từ entity sang DTO
        /// </summary>
        public void Mapping(Profile profile)
        {
            profile.CreateMap<Permission, PermissionDto>();
        }
    }
}

