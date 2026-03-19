using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class CategoryBrandRepository : BaseRepository<CategoryBrand>, ICategoryBrandRepository
    {
        public CategoryBrandRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}

