using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Domain.Entities
{
    public class UserRole : IdentityUserRole<Guid>
    {
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual Role Role { get; set; } = null!;
    }
}

