namespace Ecommerce.Domain.Entities
{
    public class Permission : BaseEntity
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public string? Category { get; set; } // Group name for categorizing permissions

        // Navigation property
        public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}

