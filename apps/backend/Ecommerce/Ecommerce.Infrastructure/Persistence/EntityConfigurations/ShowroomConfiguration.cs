using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ShowroomConfiguration : IEntityTypeConfiguration<Showroom>
    {
        public void Configure(EntityTypeBuilder<Showroom> builder)
        {
            builder.ToTable("Showrooms");

            builder.Property(s => s.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(s => s.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(s => s.Region)
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("HCM");

            builder.Property(s => s.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.Province)
                   .HasMaxLength(100);

            builder.Property(s => s.District)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.Ward)
                   .HasMaxLength(100);

            builder.Property(s => s.Address)
                   .IsRequired()
                   .HasMaxLength(300);

            builder.Property(s => s.Phone)
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("1800 6868");

            builder.Property(s => s.OpeningHours)
                   .IsRequired()
                   .HasMaxLength(100)
                   .HasDefaultValue("08:00 - 21:30");

            builder.Property(s => s.GoogleMapIframeUrl)
                   .HasMaxLength(1000);

            builder.Property(s => s.IsFlagship)
                   .HasDefaultValue(false);

            builder.Property(s => s.HasInstantPickup)
                   .HasDefaultValue(true);

            builder.Property(s => s.IsActive)
                   .HasDefaultValue(true);

            builder.Property(s => s.DisplayOrder)
                   .HasDefaultValue(0);

            // Indexes
            builder.HasIndex(s => s.Code).IsUnique();
            builder.HasIndex(s => s.Region);
            builder.HasIndex(s => s.Province);
        }
    }
}
