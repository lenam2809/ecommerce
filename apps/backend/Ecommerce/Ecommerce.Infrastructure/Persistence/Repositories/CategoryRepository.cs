using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<int> CountProductsByCategoryIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Products.CountAsync(p => p.CategoryId == id, cancellationToken);
        }

        public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Categories.AnyAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<List<Guid>> ExistIdsAsync(List<Guid> ids, CancellationToken cancellationToken = default)
        {
            return await _context.Categories
                .Where(c => ids.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Category>> GetTopCategoriesByPurchaseCount(int limit, CancellationToken cancellationToken = default)
        {
            // Giả sử có các bảng OrderItem và Order để theo dõi mua hàng
            // và mỗi Product thuộc một Category
            var topCategories = await _context.Categories
                .Select(c => new
                {
                    Category = c,
                    PurchaseCount = _context.OrderItems
                        .Where(oi => oi.Order.Status == EOrderStatus.Completed)
                        .Count(oi => oi.Product.CategoryId == c.Id)
                })
                .OrderByDescending(x => x.PurchaseCount)
                .Take(limit)
                .Select(x => new
                {
                    Category = x.Category,
                    TotalPurchases = x.PurchaseCount
                })
                .ToListAsync(cancellationToken);

            // Ánh xạ kết quả và gán TotalPurchases
            var result = topCategories.Select(x =>
            {
                var category = x.Category;
                // Gán TotalPurchases vào một thuộc tính bổ sung (nếu cần)
                // Trong trường hợp này, chúng ta sẽ ánh xạ trong AutoMapper
                return category;
            }).ToList();

            return result;
        }

        public async Task<bool> HasChildrenAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Categories.AnyAsync(p => p.ParentId == id, cancellationToken);
        }

        public async Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Products.AnyAsync(p => p.CategoryId == id, cancellationToken);
        }

        public async Task<bool> IsCodeUniqueAsync(string code, Guid? id = null, CancellationToken cancellationToken = default)
        {
            if (id.HasValue)
            {
                return !await _context.Categories.AnyAsync(p => p.Code == code && p.Id != id.Value, cancellationToken);
            }
            return !await _context.Categories.AnyAsync(p => p.Code == code, cancellationToken);
        }

        public async Task<Category> GetCategoryByNameAsync(string name, CancellationToken cancellationToken = default)
        {

            return await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Name == name, cancellationToken);
        }
    }
}

