using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public ResetPasswordCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return Result<string>.BadRequest("Mật khẩu và xác nhận mật khẩu không khớp.");
            }

            var tokenRecord = await _unitOfWork.BaseRepository<PasswordResetToken>()
                .GetQueryable()
                .FirstOrDefaultAsync(t => t.Token == request.Token, cancellationToken);

            if (tokenRecord == null || !tokenRecord.IsValid)
            {
                var errorMsg = tokenRecord == null ? "Link không hợp lệ." :
                               tokenRecord.IsExpired ? "Link đặt lại mật khẩu đã hết hạn, vui lòng yêu cầu lại." :
                               "Link này đã được sử dụng.";
                               
                return Result<string>.BadRequest(errorMsg);
            }

            var user = await _unitOfWork.Users.GetByEmailAsync(tokenRecord.Email);
            if (user == null)
            {
                return Result<string>.BadRequest("Người dùng không tồn tại.");
            }

            var resetResult = await _unitOfWork.Users.ResetPasswordAsync(user, request.NewPassword);
            
            if (!resetResult.Succeeded)
            {
                var errors = string.Join(", ", resetResult.Errors.Select(e => e.Description));
                return Result<string>.BadRequest($"Lỗi khi đặt lại mật khẩu: {errors}");
            }

            tokenRecord.UsedAt = DateTime.UtcNow;
            _unitOfWork.BaseRepository<PasswordResetToken>().Update(tokenRecord);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<string>.Success("Mật khẩu đã được đặt lại thành công.");
        }
    }
}
