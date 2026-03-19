using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho PerformanceLog
    public class PerformanceLogConfiguration : IEntityTypeConfiguration<PerformanceLog>
    {
        public void Configure(EntityTypeBuilder<PerformanceLog> builder)
        {
            builder.ToTable("PerformanceLogs");

            builder.HasKey(e => e.Id);

            // Validation cho các trường
            builder.Property(pl => pl.MethodName)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(pl => pl.ClassName)
                   .IsRequired()
                   .HasMaxLength(200);

            // Cấu hình quan hệ với User (optional)
            builder.HasOne(pl => pl.User)
                   .WithMany()
                   .HasForeignKey(pl => pl.UserId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Index hóa
            builder.HasIndex(pl => new { pl.ClassName, pl.MethodName, pl.StartTime });
        }
    }
}

