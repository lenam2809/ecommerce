using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    /// <summary>
    /// Configuration cho NotificationTemplate entity
    /// </summary>
    public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
    {
        public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
        {
            builder.ToTable("NotificationTemplates");

            // Cấu hình các properties
            builder.Property(nt => nt.Name)
                   .IsRequired()
                   .HasMaxLength(100)
                   .HasComment("Tên template");

            builder.Property(nt => nt.Code)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasComment("Mã template duy nhất");

            builder.Property(nt => nt.Type)
                   .IsRequired()
                   .HasComment("Loại thông báo");

            builder.Property(nt => nt.Category)
                   .IsRequired()
                   .HasComment("Danh mục thông báo");

            builder.Property(nt => nt.TitleTemplate)
                   .IsRequired()
                   .HasMaxLength(200)
                   .HasComment("Template tiêu đề");

            builder.Property(nt => nt.MessageTemplate)
                   .IsRequired()
                   .HasMaxLength(2000)
                   .HasComment("Template nội dung");

            builder.Property(nt => nt.IconUrl)
                   .HasMaxLength(500)
                   .HasComment("URL icon mặc định");

            builder.Property(nt => nt.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true)
                   .HasComment("Template có hoạt động không");

            builder.Property(nt => nt.RequireEmail)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Có yêu cầu gửi email không");

            builder.Property(nt => nt.RequireRealtime)
                   .IsRequired()
                   .HasDefaultValue(true)
                   .HasComment("Có yêu cầu gửi realtime không");

            builder.Property(nt => nt.EmailSubjectTemplate)
                   .HasMaxLength(200)
                   .HasComment("Template tiêu đề email");

            builder.Property(nt => nt.EmailBodyTemplate)
                   .HasMaxLength(5000)
                   .HasComment("Template nội dung email");

            builder.Property(nt => nt.DefaultExpiryMinutes)
                   .HasComment("Thời gian hết hạn mặc định (phút)");

            builder.Property(nt => nt.Variables)
                   .HasColumnType("nvarchar(max)")
                   .HasComment("Danh sách biến sử dụng trong template (JSON)");

            builder.Property(nt => nt.Description)
                   .HasMaxLength(1000)
                   .HasComment("Mô tả template");

            // Cấu hình unique constraint cho Code
            builder.HasIndex(nt => nt.Code)
                   .IsUnique()
                   .HasDatabaseName("IX_NotificationTemplates_Code_Unique");

            // Cấu hình indexes
            builder.HasIndex(nt => nt.Type)
                   .HasDatabaseName("IX_NotificationTemplates_Type");

            builder.HasIndex(nt => nt.Category)
                   .HasDatabaseName("IX_NotificationTemplates_Category");

            builder.HasIndex(nt => nt.IsActive)
                   .HasDatabaseName("IX_NotificationTemplates_IsActive");

            builder.HasIndex(nt => new { nt.Type, nt.IsActive })
                   .HasDatabaseName("IX_NotificationTemplates_Type_IsActive");

            // Query filter cho soft delete
            builder.HasQueryFilter(nt => !nt.IsDeleted);
        }
    }
}

