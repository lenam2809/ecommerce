using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // <summary>
    /// Configuration cho Review entity
    /// </summary>
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.ToTable("Reviews");

            // Cấu hình các properties với validation và comment
            builder.Property(r => r.UserName)
                   .IsRequired()
                   .HasMaxLength(100)
                   .HasComment("Tên người dùng đánh giá");

            builder.Property(r => r.UserAvatar)
                   .HasMaxLength(500)
                   .HasComment("URL avatar người dùng");

            builder.Property(r => r.Content)
                   .HasMaxLength(1000)
                   .HasComment("Nội dung đánh giá");

            builder.Property(r => r.Rating)
                   .IsRequired()
                   .HasComment("Điểm đánh giá (1-5)");

            builder.Property(r => r.Date)
                   .IsRequired()
                   .HasDefaultValueSql("now()")
                   .HasComment("Thời gian đánh giá");

            builder.Property(r => r.Likes)
                   .IsRequired()
                   .HasDefaultValue(0)
                   .HasComment("Số lượt thích");

            builder.Property(r => r.IsVerified)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Đánh giá đã được xác minh");

            // Cấu hình quan hệ với Product
            builder.HasOne(r => r.Product)
                   .WithMany(p => p.Reviews)
                   .HasForeignKey(r => r.ProductId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("FK_Reviews_Product");

            // Cấu hình quan hệ với ApplicationUser
            builder.HasOne(r => r.ApplicationUser)
                   .WithMany(u => u.Reviews)
                   .HasForeignKey(r => r.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_Reviews_ApplicationUser");

            // Cấu hình indexes để tối ưu performance
            builder.HasIndex(r => r.ProductId)
                   .HasDatabaseName("IX_Reviews_ProductId");

            builder.HasIndex(r => r.ApplicationUserId)
                   .HasDatabaseName("IX_Reviews_ApplicationUserId");

            builder.HasIndex(r => r.Rating)
                   .HasDatabaseName("IX_Reviews_Rating");

            builder.HasIndex(r => r.Date)
                   .HasDatabaseName("IX_Reviews_Date");

            builder.HasIndex(r => r.IsVerified)
                   .HasDatabaseName("IX_Reviews_IsVerified");

            builder.HasIndex(r => r.Likes)
                   .HasDatabaseName("IX_Reviews_Likes");

            // Composite indexes cho các truy vấn phổ biến
            builder.HasIndex(r => new { r.ProductId, r.Rating })
                   .HasDatabaseName("IX_Reviews_ProductId_Rating");

            builder.HasIndex(r => new { r.ProductId, r.Date })
                   .HasDatabaseName("IX_Reviews_ProductId_Date");

            builder.HasIndex(r => new { r.ProductId, r.IsVerified, r.Rating })
                   .HasDatabaseName("IX_Reviews_ProductId_IsVerified_Rating");

            builder.HasIndex(r => new { r.ApplicationUserId, r.Date })
                   .HasDatabaseName("IX_Reviews_ApplicationUserId_Date");


            // Query filter cho soft delete
            builder.HasQueryFilter(r => !r.IsDeleted);
        }
    }

    public class ReviewImageConfiguration : IEntityTypeConfiguration<ReviewImage>
    {
        public void Configure(EntityTypeBuilder<ReviewImage> builder)
        {
            builder.ToTable("ReviewImages");

            builder.Property(ri => ri.Url)
                .IsRequired()
                .HasMaxLength(255);

            // Thiết lập quan hệ với Review
            builder.HasOne(ri => ri.Review)
                .WithMany(r => r.Images)
                .HasForeignKey(ri => ri.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình indexes
            builder.HasIndex(ri => ri.ReviewId)
                   .HasDatabaseName("IX_ReviewImages_ReviewId");

            // Query filter cho soft delete
            builder.HasQueryFilter(ri => !ri.IsDeleted);
        }
    }

    public class ReviewLikeConfiguration : IEntityTypeConfiguration<ReviewLike>
    {
        public void Configure(EntityTypeBuilder<ReviewLike> builder)
        {
            builder.ToTable("ReviewLikes");

            // Cấu hình composite key để tránh duplicate likes
            builder.HasKey(rl => new { rl.ReviewId, rl.UserId })
                   .HasName("PK_ReviewLikes");

            // Cấu hình quan hệ với Review
            builder.HasOne(rl => rl.Review)
                   .WithMany(r => r.ReviewLikes)
                   .HasForeignKey(rl => rl.ReviewId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("FK_ReviewLikes_Review");

            // Cấu hình quan hệ với User - SỬA LỖI ở đây
            builder.HasOne(rl => rl.User)
                   .WithMany(u => u.ReviewLikes)
                   .HasForeignKey(rl => rl.UserId) // Sửa từ ReviewId thành UserId
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ReviewLikes_User");

            // Cấu hình indexes
            builder.HasIndex(rl => rl.ReviewId)
                   .HasDatabaseName("IX_ReviewLikes_ReviewId");

            builder.HasIndex(rl => rl.UserId)
                   .HasDatabaseName("IX_ReviewLikes_UserId");

            // Query filter cho soft delete
            builder.HasQueryFilter(rl => !rl.IsDeleted);
        }
    }


    /// <summary>
    /// Configuration cho ReviewReply entity
    /// </summary>
    public class ReviewReplyConfiguration : IEntityTypeConfiguration<ReviewReply>
    {
        public void Configure(EntityTypeBuilder<ReviewReply> builder)
        {
            builder.ToTable("ReviewReplies");

            // Cấu hình các properties
            builder.Property(rr => rr.UserName)
                   .IsRequired()
                   .HasMaxLength(100)
                   .HasComment("Tên người trả lời");

            builder.Property(rr => rr.UserAvatar)
                   .HasMaxLength(500)
                   .HasComment("URL avatar người trả lời");

            builder.Property(rr => rr.Content)
                   .IsRequired()
                   .HasMaxLength(1000)
                   .HasComment("Nội dung trả lời");

            builder.Property(rr => rr.Date)
                   .IsRequired()
                   .HasDefaultValueSql("now()")
                   .HasComment("Thời gian trả lời");

            builder.Property(rr => rr.Likes)
                   .IsRequired()
                   .HasDefaultValue(0)
                   .HasComment("Số lượt thích");

            builder.Property(rr => rr.IsVerified)
                   .IsRequired()
                   .HasDefaultValue(false)
                   .HasComment("Trả lời đã được xác minh");

            // Cấu hình quan hệ với Review
            builder.HasOne(rr => rr.Review)
                   .WithMany(r => r.ReviewReplies)
                   .HasForeignKey(rr => rr.ReviewId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("FK_ReviewReplies_Review");

            // Cấu hình quan hệ với ApplicationUser
            builder.HasOne(rr => rr.User)
                   .WithMany()
                   .HasForeignKey(rr => rr.UserId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ReviewReplies_User");

            // Cấu hình indexes
            builder.HasIndex(rr => rr.ReviewId)
                   .HasDatabaseName("IX_ReviewReplies_ReviewId");

            builder.HasIndex(rr => rr.UserId)
                   .HasDatabaseName("IX_ReviewReplies_UserId");

            builder.HasIndex(rr => rr.Date)
                   .HasDatabaseName("IX_ReviewReplies_Date");

            builder.HasIndex(rr => new { rr.ReviewId, rr.Date })
                   .HasDatabaseName("IX_ReviewReplies_ReviewId_Date");

            // Query filter cho soft delete
            builder.HasQueryFilter(rr => !rr.IsDeleted);
        }
    }

    /// <summary>
    /// Configuration cho ReviewReplyLike entity
    /// </summary>
    public class ReviewReplyLikeConfiguration : IEntityTypeConfiguration<ReviewReplyLike>
    {
        public void Configure(EntityTypeBuilder<ReviewReplyLike> builder)
        {
            builder.ToTable("ReviewReplyLikes");

            // Cấu hình composite key để tránh duplicate likes
            builder.HasKey(rrl => new { rrl.ReviewReplyId, rrl.UserId })
                   .HasName("PK_ReviewReplyLikes");

            // Cấu hình quan hệ với ReviewReply
            builder.HasOne(rrl => rrl.ReviewReply)
                   .WithMany(rr => rr.ReviewReplyLikes)
                   .HasForeignKey(rrl => rrl.ReviewReplyId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("FK_ReviewReplyLikes_ReviewReply");

            // Cấu hình quan hệ với ApplicationUser
            builder.HasOne(rrl => rrl.User)
                   .WithMany()
                   .HasForeignKey(rrl => rrl.UserId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ReviewReplyLikes_User");

            // Cấu hình indexes
            builder.HasIndex(rrl => rrl.ReviewReplyId)
                   .HasDatabaseName("IX_ReviewReplyLikes_ReviewReplyId");

            builder.HasIndex(rrl => rrl.UserId)
                   .HasDatabaseName("IX_ReviewReplyLikes_UserId");

            // Query filter cho soft delete
            builder.HasQueryFilter(rrl => !rrl.IsDeleted);

        }

    }
}

