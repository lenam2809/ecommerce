using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.UploadOrderInvoicePdf
{
    public class UploadOrderInvoicePdfCommandValidator : AbstractValidator<UploadOrderInvoicePdfCommand>
    {
        public UploadOrderInvoicePdfCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("Mã đơn hàng là bắt buộc");

            RuleFor(x => x.File)
                .Must(f => f == null || f.Length <= 10 * 1024 * 1024)
                .WithMessage("File PDF hóa đơn không được vượt quá 10MB");

            RuleFor(x => x.File)
                .Must(f => f == null || Path.GetExtension(f.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Chỉ chấp nhận file định dạng PDF (.pdf)");

            RuleFor(x => x.TaxCode)
                .MaximumLength(50).WithMessage("Mã số thuế không vượt quá 50 ký tự");

            RuleFor(x => x.CompanyName)
                .MaximumLength(255).WithMessage("Tên công ty không vượt quá 255 ký tự");

            RuleFor(x => x.CompanyAddress)
                .MaximumLength(500).WithMessage("Địa chỉ công ty không vượt quá 500 ký tự");

            RuleFor(x => x.InvoiceEmail)
                .EmailAddress().WithMessage("Email nhận hóa đơn không hợp lệ")
                .When(x => !string.IsNullOrWhiteSpace(x.InvoiceEmail));
        }
    }
}
