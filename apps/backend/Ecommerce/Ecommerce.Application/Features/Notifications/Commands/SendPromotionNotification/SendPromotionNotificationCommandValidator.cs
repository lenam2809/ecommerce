using FluentValidation;

namespace Ecommerce.Application.Features.Notifications.Commands.SendPromotionNotification
{
    public class SendPromotionNotificationCommandValidator : AbstractValidator<SendPromotionNotificationCommand>
    {
        public SendPromotionNotificationCommandValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tiêu đề không được để trống")
                .MaximumLength(200).WithMessage("Tiêu đề không được vượt quá 200 ký tự");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Nội dung thông báo không được để trống")
                .MaximumLength(1000).WithMessage("Nội dung thông báo không được vượt quá 1000 ký tự");

            RuleFor(x => x.ExpiresAt)
                .Must(BeInFuture)
                .When(x => x.ExpiresAt.HasValue)
                .WithMessage("Thời gian hết hạn phải lớn hơn thời gian hiện tại");

            RuleFor(x => x.ActionUrl)
                .Must(BeValidUrl)
                .When(x => !string.IsNullOrEmpty(x.ActionUrl))
                .WithMessage("URL hành động không hợp lệ");

            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrl)
                .When(x => !string.IsNullOrEmpty(x.ImageUrl))
                .WithMessage("URL hình ảnh không hợp lệ");
        }

        private static bool BeInFuture(DateTime? dateTime)
        {
            return !dateTime.HasValue || dateTime.Value > DateTime.UtcNow;
        }

        private static bool BeValidUrl(string? url)
        {
            return string.IsNullOrEmpty(url) || Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }
}

