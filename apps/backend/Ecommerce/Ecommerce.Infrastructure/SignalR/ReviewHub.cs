using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Ecommerce.Infrastructure.SignalR
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ReviewHub : Hub
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly ILogger<ReviewHub> _logger;

        public ReviewHub(IReviewRepository reviewRepository, ILogger<ReviewHub> logger)
        {
            _reviewRepository = reviewRepository;
            _logger = logger;
        }

        public async Task JoinProductGroup(string productId)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"product_{productId}");
                _logger.LogInformation("User {UserId} joined product group {ProductId}", Context.UserIdentifier, productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining product group {ProductId}", productId);
            }
        }

        public async Task LeaveProductGroup(string productId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"product_{productId}");
                _logger.LogInformation("User {UserId} left product group {ProductId}", Context.UserIdentifier, productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving product group {ProductId}", productId);
            }
        }

        public async Task SendTypingIndicator(string productId, bool isTyping)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";

                await Clients.OthersInGroup($"product_{productId}").SendAsync("UserTyping", new
                {
                    UserId = userId,
                    UserName = userName,
                    IsTyping = isTyping,
                    ProductId = productId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending typing indicator for product {ProductId}", productId);
            }
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("User {UserId} connected to ReviewHub", userId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("User {UserId} disconnected from ReviewHub", userId);
            await base.OnDisconnectedAsync(exception);
        }

        // Method để broadcast review mới
        //public async Task BroadcastNewReview(string productId, ReviewDto review)
        //{
        //    try
        //    {
        //        await Clients.Group($"product_{productId}").SendAsync("NewReview", review);
        //        _logger.LogInformation($"Broadcasted new review for product {productId}");
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, $"Error broadcasting new review for product {productId}");
        //    }
        //}

        public async Task BroadcastNewReview(string productId, ReviewDto review)
        {
            try
            {
                await Clients.OthersInGroup($"product_{productId}").SendAsync("NewReview", review);
                _logger.LogInformation("Broadcasted new review excluding sender for product {ProductId}", productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error broadcasting new review for product {ProductId}", productId);
            }
        }


        // Method để broadcast cập nhật rating
        public async Task BroadcastRatingUpdate(string productId, double newRating, int reviewCount)
        {
            try
            {
                await Clients.Group($"product_{productId}").SendAsync("RatingUpdated", new
                {
                    ProductId = productId,
                    NewRating = newRating,
                    ReviewCount = reviewCount
                });
                _logger.LogInformation("Broadcasted rating update for product {ProductId} with rating {NewRating}", productId, newRating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error broadcasting rating update for product {ProductId}", productId);
            }
        }

        // Method để broadcast like/unlike
        public async Task BroadcastReviewLikeUpdate(string productId, string reviewId, int likeCount)
        {
            try
            {
                await Clients.Group($"product_{productId}").SendAsync("ReviewLikeUpdated", new
                {
                    ReviewId = reviewId,
                    LikeCount = likeCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error broadcasting like update for review {ReviewId}", reviewId);
            }
        }
    }
}

