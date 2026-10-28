using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Commands.CreateShowroom
{
    public class CreateShowroomCommandValidator : AbstractValidator<CreateShowroomCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateShowroomCommandValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Mã showroom không được để trống")
                .MaximumLength(50).WithMessage("Mã showroom không được vượt quá 50 ký tự")
                .MustAsync(async (code, cancellation) =>
                {
                    if (string.IsNullOrWhiteSpace(code)) return true;
                    var trimmed = code.Trim().ToLower();
                    var exists = await _unitOfWork.BaseRepository<Showroom>()
                        .GetQueryable()
                        .AnyAsync(s => s.Code.ToLower() == trimmed, cancellation);
                    return !exists;
                }).WithMessage("Mã showroom đã tồn tại trong hệ thống");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên showroom không được để trống")
                .MaximumLength(200).WithMessage("Tên showroom không được vượt quá 200 ký tự");

            RuleFor(x => x.Region)
                .NotEmpty().WithMessage("Khu vực (Region) không được để trống")
                .MaximumLength(50).WithMessage("Khu vực không được vượt quá 50 ký tự");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("Tỉnh/Thành phố không được để trống")
                .MaximumLength(100).WithMessage("Tỉnh/Thành phố không được vượt quá 100 ký tự");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Địa chỉ không được để trống")
                .MaximumLength(500).WithMessage("Địa chỉ không được vượt quá 500 ký tự");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Số điện thoại không được để trống")
                .MaximumLength(50).WithMessage("Số điện thoại không được vượt quá 50 ký tự");

            RuleFor(x => x.OpeningHours)
                .NotEmpty().WithMessage("Giờ mở cửa không được để trống")
                .MaximumLength(100).WithMessage("Giờ mở cửa không được vượt quá 100 ký tự");
        }
    }
}
