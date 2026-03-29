using FluentValidation;

namespace Ecommerce.Application.Features.Marquee.Commands.UpdateMarqueeMessage
{
    public class UpdateMarqueeMessageCommandValidator : AbstractValidator<UpdateMarqueeMessageCommand>
    {
        public UpdateMarqueeMessageCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("ID không được để trống.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Nội dung không được để trống.")
                .MaximumLength(1000).WithMessage("Nội dung không được vượt quá 1000 ký tự.");

            RuleFor(x => x.Speed)
                .InclusiveBetween(10, 500).WithMessage("Tốc độ phải nằm trong khoảng 10-500.");

            RuleFor(x => x.Priority)
                .GreaterThanOrEqualTo(0).WithMessage("Độ ưu tiên phải lớn hơn hoặc bằng 0.");

            RuleFor(x => x.LinkUrl)
                .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
                .When(x => !string.IsNullOrEmpty(x.LinkUrl))
                .WithMessage("URL không hợp lệ.");
        }
    }
}
