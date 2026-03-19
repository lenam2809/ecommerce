using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    /// <summary>
    /// Configuration cho Notification entity
    /// </summary>
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");

            // Cấu hình các properties
            builder.Property(n => n.Title)
                   .IsRequired()
                   .HasMaxLength(100)
                   .HasComment("Tiêu đề thông báo");

            builder.Property(n => n.Message)
                   .IsRequired()
                   .HasMaxLength(1000)
                   .HasComment("Nội dung thông báo");

            builder.Property(n => n.Type)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasComment("Loại thông báo");

            builder.Property(n => n.Category)
                   .IsRequired()
                   .HasComment("Danh mục thông báo");


            builder.Property(n => n.IsRead)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Trạng thái đã đọc");

            builder.Property(n => n.ReadAt)
                   .HasComment("Thời gian đọc thông báo");

            builder.Property(n => n.ExpiresAt)
                   .HasComment("Thời gian hết hạn");

            builder.Property(n => n.TargetGroup)
                   .HasMaxLength(50)
                   .HasComment("Nhóm đối tượng nhận thông báo");

            builder.Property(n => n.Metadata)
                   .HasColumnType("nvarchar(max)")
                   .HasComment("Dữ liệu bổ sung dạng JSON");

            builder.Property(n => n.ActionUrl)
                   .HasMaxLength(500)
                   .HasComment("URL hành động khi click thông báo");

            builder.Property(n => n.IconUrl)
                   .HasMaxLength(500)
                   .HasComment("URL icon thông báo");

            builder.Property(n => n.IsSentRealtime)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Đã gửi realtime chưa");

            builder.Property(n => n.IsSentEmail)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Đã gửi email chưa");

            builder.Property(n => n.RetryCount)
                   .IsRequired()
                   .HasDefaultValue(0)
                   .HasComment("Số lần thử gửi lại");

            builder.Property(n => n.LastError)
                   .HasMaxLength(1000)
                   .HasComment("Lỗi cuối cùng nếu có");

            // Cấu hình quan hệ với ApplicationUser (Sender)
            builder.HasOne(n => n.Sender)
                   .WithMany()
                   .HasForeignKey(n => n.SenderId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .HasConstraintName("FK_Notifications_Sender");

            // Cấu hình quan hệ với ApplicationUser (Recipient)
            builder.HasOne(n => n.Recipient)
                   .WithMany()
                   .HasForeignKey(n => n.RecipientId)
                   .OnDelete(DeleteBehavior.Restrict) // hoặc SetNull
                   .HasConstraintName("FK_Notifications_Recipient");

            // Cấu hình indexes để tối ưu performance
            builder.HasIndex(n => n.RecipientId)
                   .HasDatabaseName("IX_Notifications_RecipientId");

            builder.HasIndex(n => n.Type)
                   .HasDatabaseName("IX_Notifications_Type");

            builder.HasIndex(n => n.Category)
                   .HasDatabaseName("IX_Notifications_Category");

            builder.HasIndex(n => n.IsRead)
                   .HasDatabaseName("IX_Notifications_IsRead");

            builder.HasIndex(n => n.CreatedAt)
                   .HasDatabaseName("IX_Notifications_CreatedAt");

            builder.HasIndex(n => n.ExpiresAt)
                   .HasDatabaseName("IX_Notifications_ExpiresAt");

            builder.HasIndex(n => n.Priority)
                   .HasDatabaseName("IX_Notifications_Priority");

            // Composite indexes cho các truy vấn phổ biến
            builder.HasIndex(n => new { n.RecipientId, n.IsRead })
                   .HasDatabaseName("IX_Notifications_RecipientId_IsRead");

            builder.HasIndex(n => new { n.RecipientId, n.CreatedAt })
                   .HasDatabaseName("IX_Notifications_RecipientId_CreatedAt");

            builder.HasIndex(n => new { n.TargetGroup, n.CreatedAt })
                   .HasDatabaseName("IX_Notifications_TargetGroup_CreatedAt");

            builder.HasIndex(n => new { n.Type, n.Category, n.CreatedAt })
                   .HasDatabaseName("IX_Notifications_Type_Category_CreatedAt");

            builder.HasIndex(n => new { n.IsRead, n.Priority, n.CreatedAt })
                   .HasDatabaseName("IX_Notifications_IsRead_Priority_CreatedAt");

            // Query filter cho soft delete
            builder.HasQueryFilter(n => !n.IsDeleted);
        }
    }
}

