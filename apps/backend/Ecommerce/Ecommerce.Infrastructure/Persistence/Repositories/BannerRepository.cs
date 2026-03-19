using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class BannerRepository : BaseRepository<Banner>, IBannerRepository
    {
        public BannerRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}

