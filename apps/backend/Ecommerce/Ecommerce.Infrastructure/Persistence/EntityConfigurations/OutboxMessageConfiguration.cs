using Ecommerce.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations;

public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("OutboxMessages");

        builder.HasKey(message => message.Id);

        builder.Property(message => message.Type)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(message => message.Payload)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(message => message.Error)
            .HasMaxLength(4000);

        builder.Property(message => message.Status)
            .HasConversion<int>();

        builder.HasIndex(message => new { message.Status, message.RetryCount, message.OccurredAtUtc })
            .HasDatabaseName("IX_OutboxMessages_Status_RetryCount_OccurredAtUtc");
    }
}
