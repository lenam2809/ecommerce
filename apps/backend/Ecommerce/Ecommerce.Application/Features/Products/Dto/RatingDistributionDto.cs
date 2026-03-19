using Ecommerce.Application.Common.Mappings;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class RatingDistributionDto : IMapFrom<Domain.Entities.RatingDistribution>
    {
        public int Stars { get; set; }
        public int Percentage { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Domain.Entities.RatingDistribution, RatingDistributionDto>();
        }
    }
}

