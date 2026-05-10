using Ecommerce.Application.Common.Interfaces;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Services
{
    public sealed class EmailQueue : IEmailQueue
    {
        private readonly Channel<EmailMessage> _queue = Channel.CreateBounded<EmailMessage>(new BoundedChannelOptions(500)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });

        public ValueTask QueueEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
        {
            return _queue.Writer.WriteAsync(message, cancellationToken);
        }

        public ValueTask<EmailMessage> DequeueAsync(CancellationToken cancellationToken)
        {
            return _queue.Reader.ReadAsync(cancellationToken);
        }
    }
}
