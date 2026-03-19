using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class LogEntryConfiguration : IEntityTypeConfiguration<LogEntry>
    {
        public void Configure(EntityTypeBuilder<LogEntry> builder)
        {
            builder.ToTable("LogEntries");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Timestamp)
                   .IsRequired();

            builder.Property(e => e.Level)
                   .IsRequired()
                   .HasConversion<string>(); // Convert enum to string in database

            builder.Property(e => e.Message)
                   .IsRequired()
                   .HasMaxLength(2000); // Adjust max length as needed

            builder.Property(e => e.EventName)
                   .HasMaxLength(100);

            builder.Property(e => e.SourceContext)
                   .HasMaxLength(200);

            builder.Property(e => e.IpAddress)
                   .HasMaxLength(50);

            builder.Property(e => e.UserAgent)
                   .HasMaxLength(500);


            // Configure relationship with ApplicationUser
            builder.HasOne(e => e.User)
                   .WithMany()
                   .HasForeignKey(e => e.ApplicationUserId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Add indexes for frequently queried fields
            builder.HasIndex(e => new { e.Timestamp, e.Level });
            builder.HasIndex(e => e.EventName);
            builder.HasIndex(e => e.SourceContext);
            builder.HasIndex(e => e.ApplicationUserId);
        }
    }
}

