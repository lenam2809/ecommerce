using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class PromoCodeRepository : BaseRepository<PromoCode>, IPromoCodeRepository
    {
        public PromoCodeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null)
        {
            return !await _context.PromoCodes
                .AnyAsync(p => p.Code == code && (excludeId == null || p.Id != excludeId));
        }

        public async Task<PromoCode> GetByCodeAsync(string code)
        {
            return await _context.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == code);
        }

        public async Task<IEnumerable<PromoCode>> GetActivePromoCodesAsync()
        {
            var now = DateTime.Now;
            return await _context.PromoCodes
                .Where(p => p.IsActive &&
                            p.ValidFrom <= now &&
                            p.ValidTo >= now &&
                            (p.UsageLimit == 0 || p.TimesUsed < p.UsageLimit))
                .ToListAsync();
        }

        public async Task<bool> IsPromoCodeValidAsync(string code, decimal orderTotal)
        {
            var promoCode = await GetByCodeAsync(code);

            if (promoCode == null)
                return false;

            var now = DateTime.Now;

            return promoCode.IsActive &&
                   promoCode.ValidFrom <= now &&
                   promoCode.ValidTo >= now &&
                   (promoCode.UsageLimit == 0 || promoCode.TimesUsed < promoCode.UsageLimit);
        }

        public async Task<PromoCode> UsePromoCodeAsync(string code)
        {
            var promoCode = await GetByCodeAsync(code);

            if (promoCode != null && promoCode.IsActive)
            {
                promoCode.TimesUsed++;
                Update(promoCode);
                await _context.SaveChangesAsync();
            }

            return promoCode;
        }
    }
}

