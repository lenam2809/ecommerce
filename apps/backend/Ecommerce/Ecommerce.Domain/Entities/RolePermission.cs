using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class RolePermission
    {
        [ForeignKey(nameof(Role))]
        public Guid RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;

        [ForeignKey(nameof(Permission))]
        public Guid PermissionId { get; set; }
        public virtual Permission Permission { get; set; } = null!;
    }

}

