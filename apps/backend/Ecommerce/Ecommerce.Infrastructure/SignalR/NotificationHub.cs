using Ecommerce.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;

namespace Ecommerce.Infrastructure.SignalR
{
    /// <summary>
    /// SignalR Hub for real-time notifications
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            try
            {
                // You can use User.Identity.Name to get the user's email
                var user = Context.User;

                // Add admin users to the "Administrators" group for targeted notifications
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
                Console.WriteLine($"Connection error: {ex}"); // Log lỗi
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

