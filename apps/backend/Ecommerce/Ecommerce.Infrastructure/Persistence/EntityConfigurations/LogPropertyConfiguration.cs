using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class LogPropertyConfiguration : IEntityTypeConfiguration<LogProperty>
    {
        public void Configure(EntityTypeBuilder<LogProperty> builder)
        {
            builder.ToTable("LogProperties");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Key)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.Value)
                .IsRequired()
                .HasColumnType("text");

            builder.HasOne<LogEntry>()
                .WithMany(e => e.Properties)
                .HasForeignKey(p => p.LogEntryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
