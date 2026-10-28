using FluentValidation;

namespace Ecommerce.Application.Features.Returns.Commands.AddReturnRequestLog
{
    public class AddReturnRequestLogCommandValidator : AbstractValidator<AddReturnRequestLogCommand>
    {
        public AddReturnRequestLogCommandValidator()
        {
            RuleFor(x => x.ReturnRequestId)
                .NotEmpty()
                .WithMessage("Mã yêu cầu đổi/trả không được để trống.");

            RuleFor(x => x.Step)
                .InclusiveBetween(1, 5)
                .WithMessage("Bước kiểm định RMA phải từ 1 đến 5.");

            RuleFor(x => x.Title)
                .MaximumLength(200)
                .WithMessage("Tiêu đề nhật ký không được vượt quá 200 ký tự.");

            RuleFor(x => x.Note)
                .MaximumLength(1000)
                .WithMessage("Ghi chú kiểm định không được vượt quá 1000 ký tự.");
        }
    }
}
