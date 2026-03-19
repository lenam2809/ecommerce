using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");

            builder.HasKey(e => e.Id);

            builder.Property(a => a.EntityName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.ActionType)
                   .IsRequired()
                   .HasMaxLength(50);

            // Cấu hình quan hệ với User
            builder.HasOne(a => a.User)
                   .WithMany()
                   .HasForeignKey(a => a.UserId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Index hóa
            builder.HasIndex(a => new { a.EntityName, a.ActionType, a.CreatedAt });
        }
    }
}

