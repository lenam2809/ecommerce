using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho CustomerAddress
    public class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
    {
        public void Configure(EntityTypeBuilder<CustomerAddress> builder)
        {
            builder.ToTable("CustomerAddresses");

            builder.Property(ca => ca.AddressType)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("Home");

            builder.Property(ca => ca.FullName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(ca => ca.ReceiverName)
                   .HasMaxLength(100)
                   .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(ca => ca.ReceiverPhone)
                   .HasMaxLength(20)
                   .UsePropertyAccessMode(PropertyAccessMode.Property);

            builder.Property(ca => ca.Street)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(ca => ca.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(ca => ca.PostalCode)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(ca => ca.Phone)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(ca => ca.IsDefault)
                   .HasDefaultValue(false);

            // Cấu hình quan hệ với User
            builder.HasOne(ca => ca.ApplicationUser)
                   .WithMany(u => u.Addresses)
                   .HasForeignKey(ca => ca.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Index hóa
            builder.HasIndex(ca => new { ca.ApplicationUserId, ca.IsDefault });
        }
    }
}
