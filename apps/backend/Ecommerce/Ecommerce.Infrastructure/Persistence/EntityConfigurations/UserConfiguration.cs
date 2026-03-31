using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class UserConfiguration : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
        {
            builder.Property(u => u.CustomerLevel)
                .IsRequired();

            builder.Property(u => u.PromotionPoints)
                .HasDefaultValue(0);

            builder.Property(u => u.FirstName)
                .HasMaxLength(50);

            builder.Property(u => u.LastName)
                .HasMaxLength(50);

            // Index for faster lookups
            builder.HasIndex(u => u.CustomerLevel);

            // Email lookup index (NormalizedEmail index đã được Identity tạo — index này hỗ trợ case-sensitive queries)
            builder.HasIndex(u => u.Email)
                   .HasDatabaseName("IX_AspNetUsers_Email");
        }
    }
}

