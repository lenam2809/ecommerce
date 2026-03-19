using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{

    // Cấu hình cho UserActivity
    public class AccountLockConfiguration : IEntityTypeConfiguration<AccountLock>
    {
        public void Configure(EntityTypeBuilder<AccountLock> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Reason).IsRequired().HasMaxLength(500);
            builder.Property(e => e.Notes).HasMaxLength(1000);

            builder.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.LockedByUser)
                .WithMany()
                .HasForeignKey(e => e.LockedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.UnlockedByUser)
                .WithMany()
                .HasForeignKey(e => e.UnlockedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(e => e.UserId);
            builder.HasIndex(e => e.IsActive);
            builder.HasIndex(e => e.ExpiresAt);
        }
    }
}

