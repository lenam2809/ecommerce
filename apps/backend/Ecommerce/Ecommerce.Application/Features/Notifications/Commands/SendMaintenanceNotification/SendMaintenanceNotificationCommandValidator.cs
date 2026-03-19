using FluentValidation;

namespace Ecommerce.Application.Features.Notifications.Commands.SendMaintenanceNotification
{
    public class SendMaintenanceNotificationCommandValidator : AbstractValidator<SendMaintenanceNotificationCommand>
    {
        public SendMaintenanceNotificationCommandValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tiêu đề không được để trống")
                .MaximumLength(200).WithMessage("Tiêu đề không được vượt quá 200 ký tự");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Nội dung thông báo không được để trống")
                .MaximumLength(1000).WithMessage("Nội dung thông báo không được vượt quá 1000 ký tự");

            RuleFor(x => x.ScheduledTime)
                .NotEmpty().WithMessage("Thời gian bảo trì không được để trống")
                .Must(BeInFuture).WithMessage("Thời gian bảo trì phải lớn hơn thời gian hiện tại");

            RuleFor(x => x.DurationMinutes)
                .GreaterThan(0).WithMessage("Thời gian bảo trì phải lớn hơn 0 phút")
                .LessThanOrEqualTo(24 * 60).WithMessage("Thời gian bảo trì không được vượt quá 24 giờ");

            RuleFor(x => x.ActionUrl)
                .Must(BeValidUrl)
                .When(x => !string.IsNullOrEmpty(x.ActionUrl))
                .WithMessage("URL hành động không hợp lệ");
        }

        private static bool BeInFuture(DateTime dateTime)
        {
            return dateTime > DateTime.UtcNow;
        }

        private static bool BeValidUrl(string? url)
        {
            return string.IsNullOrEmpty(url) || Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }
}

