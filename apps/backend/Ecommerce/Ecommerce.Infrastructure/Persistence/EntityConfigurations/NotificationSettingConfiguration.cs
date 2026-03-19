using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    /// <summary>
    /// Configuration cho NotificationSetting entity
    /// </summary>
    public class NotificationSettingConfiguration : IEntityTypeConfiguration<NotificationSetting>
    {
        public void Configure(EntityTypeBuilder<NotificationSetting> builder)
        {
            builder.ToTable("NotificationSettings");

            // Cấu hình composite key
            builder.HasKey(ns => new { ns.UserId, ns.NotificationType })
                   .HasName("PK_NotificationSettings");

            // Cấu hình các properties
            builder.Property(ns => ns.NotificationType)
                   .IsRequired()
                   .HasComment("Loại thông báo");

            builder.Property(ns => ns.EnableRealtime)
                   .IsRequired()
                   .HasDefaultValue(true)
                   .HasComment("Cho phép nhận thông báo realtime");

            builder.Property(ns => ns.EnableEmail)
                   .IsRequired()
                   .HasDefaultValue(true)
                   .HasComment("Cho phép nhận thông báo email");

            builder.Property(ns => ns.EnableSms)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Cho phép nhận thông báo SMS");

            builder.Property(ns => ns.EnablePush)
                   .IsRequired()
                   .HasDefaultValue(true)
                   .HasComment("Cho phép nhận push notification");

            builder.Property(ns => ns.DoNotDisturbStart)
                   .HasComment("Thời gian bắt đầu không làm phiền");

            builder.Property(ns => ns.DoNotDisturbEnd)
                   .HasComment("Thời gian kết thúc không làm phiền");


            builder.Property(ns => ns.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true)
                   .HasComment("Cài đặt có hoạt động không");

            // Cấu hình quan hệ với ApplicationUser
            builder.HasOne(ns => ns.User)
                   .WithMany()
                   .HasForeignKey(ns => ns.UserId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("FK_NotificationSettings_User");

            // Cấu hình indexes
            builder.HasIndex(ns => ns.UserId)
                   .HasDatabaseName("IX_NotificationSettings_UserId");

            builder.HasIndex(ns => ns.NotificationType)
                   .HasDatabaseName("IX_NotificationSettings_NotificationType");

            builder.HasIndex(ns => ns.IsActive)
                   .HasDatabaseName("IX_NotificationSettings_IsActive");

            builder.HasIndex(ns => new { ns.UserId, ns.IsActive })
                   .HasDatabaseName("IX_NotificationSettings_UserId_IsActive");

            // Query filter cho soft delete
            builder.HasQueryFilter(ns => !ns.IsDeleted);
        }
    }
}

