using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(o => o.ShippingAddress)
                .NotEmpty().WithMessage("Địa chỉ giao hàng là bắt buộc")
                .When(o => o.DeliveryType != Domain.Enums.EDeliveryType.ShowroomPickup && o.DeliveryMethod != "ShowroomPickup");

            RuleFor(o => o.ShippingAddress)
                .MaximumLength(500).WithMessage("Địa chỉ giao hàng không được vượt quá 500 ký tự");

            RuleFor(o => o.Phone)
                .NotEmpty().WithMessage("Số điện thoại là bắt buộc")
                .Matches(@"^\+?[0-9]{8,15}$").WithMessage("Định dạng số điện thoại không hợp lệ");

            RuleFor(o => o.Email)
                .NotEmpty().WithMessage("Email là bắt buộc")
                .EmailAddress().WithMessage("Định dạng email không hợp lệ");

            RuleFor(o => o.GuestName)
                .MaximumLength(100).WithMessage("Tên khách không được vượt quá 100 ký tự")
                .When(o => !string.IsNullOrWhiteSpace(o.GuestName));

            RuleFor(o => o.GuestName)
                .NotEmpty().WithMessage("Tên khách là bắt buộc cho đơn hàng guest")
                .When(o => !o.ApplicationUserId.HasValue);

            RuleFor(o => o.GuestId)
                .MaximumLength(64).WithMessage("Guest ID không được vượt quá 64 ký tự")
                .When(o => !string.IsNullOrWhiteSpace(o.GuestId));

            RuleFor(o => o.DeliveryInstructions)
                .MaximumLength(500).WithMessage("Hướng dẫn giao hàng không được vượt quá 500 ký tự");

            RuleFor(o => o.ShowroomId)
                .NotEmpty().WithMessage("Vui lòng chọn showroom để nhận hàng")
                .When(o => o.DeliveryType == Domain.Enums.EDeliveryType.ShowroomPickup || o.DeliveryMethod == "ShowroomPickup");

            // Validation hóa đơn VAT khi tích chọn xuất hóa đơn
            RuleFor(o => GetTaxCode(o)!)
                .NotEmpty().WithMessage("Mã số thuế là bắt buộc khi yêu cầu hóa đơn VAT")
                .Matches(@"^(\d{10}|\d{13}|\d{10}-\d{3})$").WithMessage("Mã số thuế không đúng định dạng (phải gồm 10 hoặc 13 chữ số)")
                .When(o => IsInvoiceRequested(o));

            RuleFor(o => GetCompanyName(o)!)
                .NotEmpty().WithMessage("Tên công ty là bắt buộc khi yêu cầu hóa đơn VAT")
                .When(o => IsInvoiceRequested(o));

            RuleFor(o => GetCompanyAddress(o)!)
                .NotEmpty().WithMessage("Địa chỉ công ty là bắt buộc khi yêu cầu hóa đơn VAT")
                .When(o => IsInvoiceRequested(o));

            RuleFor(o => o.OrderItems)
                .NotEmpty().WithMessage("Đơn hàng phải có ít nhất một sản phẩm");

            RuleForEach(o => o.OrderItems).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId)
                    .NotEmpty().WithMessage("Mã sản phẩm là bắt buộc");

                item.RuleFor(i => i.Quantity)
                    .GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0");
            });
        }

        private static bool IsInvoiceRequested(CreateOrderCommand o)
        {
            return (o.Invoice != null && o.Invoice.RequireInvoice) || o.RequireInvoice;
        }

        private static string? GetTaxCode(CreateOrderCommand o)
        {
            return (o.Invoice != null && !string.IsNullOrWhiteSpace(o.Invoice.TaxCode)) ? o.Invoice.TaxCode : o.TaxCode;
        }

        private static string? GetCompanyName(CreateOrderCommand o)
        {
            return (o.Invoice != null && !string.IsNullOrWhiteSpace(o.Invoice.CompanyName)) ? o.Invoice.CompanyName : o.CompanyName;
        }

        private static string? GetCompanyAddress(CreateOrderCommand o)
        {
            return (o.Invoice != null && !string.IsNullOrWhiteSpace(o.Invoice.CompanyAddress)) ? o.Invoice.CompanyAddress : o.CompanyAddress;
        }
    }
}
