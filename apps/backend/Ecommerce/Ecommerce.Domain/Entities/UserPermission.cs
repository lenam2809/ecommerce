using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class UserPermission
    {
        [ForeignKey(nameof(ApplicationUser))]
        public Guid ApplicationUserId { get; set; }
        [ForeignKey(nameof(Permission))]
        public Guid PermissionId { get; set; }

        // Navigation properties
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
        public virtual Permission Permission { get; set; } = null!;
    }
}

