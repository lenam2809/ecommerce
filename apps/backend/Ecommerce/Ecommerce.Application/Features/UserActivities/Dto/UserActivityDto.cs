using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.UserActivities.Dto
{
    public class UserActivityDto : IMapFrom<UserActivity>
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public required string ActivityType { get; set; }
        public string? Description { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Location { get; set; }
        public DateTime Timestamp { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<UserActivity, UserActivityDto>();
        }
    }
}

