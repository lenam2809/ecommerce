using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;

namespace Ecommerce.Infrastructure.Services
{
    public class CustomerLevelService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CustomerLevelService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task UpdateCustomerLevel(ApplicationUser user)
        {
            // Kiểm tra và cập nhật cấp độ khách hàng dựa trên điểm tích lũy
            var newLevel = CalculateCustomerLevel(user.PromotionPoints);

            if (user.CustomerLevel != newLevel)
            {
                user.CustomerLevel = newLevel;
                user.UpdatedAt = DateTime.Now;

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CompleteAsync();
            }
        }

        private ECustomerLevel CalculateCustomerLevel(int points)
        {
            if (points >= 10000)
                return ECustomerLevel.Diamond;
            if (points >= 5000)
                return ECustomerLevel.Gold;
            if (points >= 1000)
                return ECustomerLevel.Silver;
            return ECustomerLevel.Bronze;
        }

        public async Task AddPromotionPoints(Guid userId, int points)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user != null)
            {
                user.PromotionPoints += points;
                user.UpdatedAt = DateTime.Now;

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CompleteAsync();

                await UpdateCustomerLevel(user);
            }
        }

        public decimal ApplyDiscount(decimal price, ECustomerLevel level)
        {
            return level switch
            {
                ECustomerLevel.Diamond => price * 0.85m,  // 15% discount
                ECustomerLevel.Gold => price * 0.90m,     // 10% discount
                ECustomerLevel.Silver => price * 0.95m,   // 5% discount
                _ => price,                             // No discount for Bronze
            };
        }
    }
}

