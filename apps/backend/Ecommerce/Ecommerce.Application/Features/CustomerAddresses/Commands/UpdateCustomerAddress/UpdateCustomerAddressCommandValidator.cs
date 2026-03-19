using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress
{
    public class UpdateCustomerAddressCommandValidator : AbstractValidator<UpdateCustomerAddressCommand>
    {
        private readonly ICustomerAddressRepository _customerAddressRepository;

        public UpdateCustomerAddressCommandValidator(ICustomerAddressRepository customerAddressRepository)
        {
            _customerAddressRepository = customerAddressRepository;

            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("ID địa chỉ không được để trống")
                .MustAsync(async (id, cancellation) => await _customerAddressRepository.ExistsAsync(id, cancellation))
                .WithMessage("Địa chỉ không tồn tại");

            RuleFor(x => x.ApplicationUserId)
                .NotEmpty().WithMessage("ID người dùng không được để trống");

            RuleFor(x => x)
                .MustAsync(async (command, cancellation) =>
                    await _customerAddressRepository.UserOwnsAddressAsync(command.Id, command.ApplicationUserId, cancellation))
                .WithMessage("Bạn không có quyền cập nhật địa chỉ này");

            RuleFor(x => x.AddressType)
                .NotEmpty().WithMessage("Loại địa chỉ không được để trống")
                .MaximumLength(50).WithMessage("Loại địa chỉ không được vượt quá 50 ký tự");

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Họ tên không được để trống")
                .MaximumLength(100).WithMessage("Họ tên không được vượt quá 100 ký tự");

            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("Địa chỉ đường không được để trống")
                .MaximumLength(200).WithMessage("Địa chỉ đường không được vượt quá 200 ký tự");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("Thành phố không được để trống")
                .MaximumLength(100).WithMessage("Thành phố không được vượt quá 100 ký tự");

            RuleFor(x => x.State)
                .NotEmpty().WithMessage("Tỉnh/Bang không được để trống")
                .MaximumLength(100).WithMessage("Tỉnh/Bang không được vượt quá 100 ký tự");

            RuleFor(x => x.PostalCode)
                .NotEmpty().WithMessage("Mã bưu điện không được để trống")
                .MaximumLength(20).WithMessage("Mã bưu điện không được vượt quá 20 ký tự");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("Quốc gia không được để trống")
                .MaximumLength(100).WithMessage("Quốc gia không được vượt quá 100 ký tự");

            RuleFor(x => x.Phone)
                .MaximumLength(20).WithMessage("Số điện thoại không được vượt quá 20 ký tự")
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Số điện thoại không hợp lệ")
                .When(x => !string.IsNullOrEmpty(x.Phone));
        }
    }
}

