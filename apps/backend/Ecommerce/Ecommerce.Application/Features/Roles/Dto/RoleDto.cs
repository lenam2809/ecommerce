using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Roles.Dto
{
    public class RoleDto : IMapFrom<Role>
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string NormalizedName { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Role, RoleDto>();
        }
    }
}

