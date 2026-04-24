using Ecommerce.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.SignalR
{
    /// <summary>
    /// SignalR Hub for real-time notifications
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var user = Context.User;

                if (user != null && user.IsInRole(EUserRoles.Admin))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Administrators");
                }

                if (user != null && user.IsInRole(EUserRoles.Customer))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Customers");
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationHub connection failed for connection {ConnectionId}", Context.ConnectionId);
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (Context.User?.IsInRole(EUserRoles.Admin) == true)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Administrators");
            }

            if (Context.User?.IsInRole(EUserRoles.Customer) == true)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Customers");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
