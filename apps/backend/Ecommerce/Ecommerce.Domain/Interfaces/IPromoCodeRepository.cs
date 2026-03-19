using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IPromoCodeRepository : IRepository<PromoCode>
    {
        Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null);
        Task<PromoCode> GetByCodeAsync(string code);
        Task<IEnumerable<PromoCode>> GetActivePromoCodesAsync();
        Task<bool> IsPromoCodeValidAsync(string code, decimal orderTotal);
        Task<PromoCode> UsePromoCodeAsync(string code);
    }
}

