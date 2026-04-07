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
            const string invalidLinkError = "Invalid or expired link";

            if (request.NewPassword != request.ConfirmPassword)
            {
                return Result<string>.BadRequest("Password and confirmation do not match.");
            }

            var tokenQuery = _unitOfWork.BaseRepository<PasswordResetToken>().GetQueryable();
            PasswordResetToken? tokenRecord = null;

            if (!string.IsNullOrWhiteSpace(request.RequestId) && Guid.TryParse(request.RequestId, out var requestGuid))
            {
                tokenRecord = await tokenQuery.FirstOrDefaultAsync(t => t.Id == requestGuid, cancellationToken);
            }
            else if (!string.IsNullOrWhiteSpace(request.Token))
            {
                tokenRecord = await tokenQuery.FirstOrDefaultAsync(t => t.Token == request.Token, cancellationToken);
            }

            if (tokenRecord == null || !tokenRecord.IsValid)
            {
                return Result<string>.BadRequest(invalidLinkError);
            }

            var user = await _unitOfWork.Users.GetByEmailAsync(tokenRecord.Email);
            if (user == null)
            {
                return Result<string>.BadRequest(invalidLinkError);
            }

            var resetResult = await _unitOfWork.Users.ResetPasswordAsync(user, request.NewPassword);
            if (!resetResult.Succeeded)
            {
                var errors = string.Join(", ", resetResult.Errors.Select(e => e.Description));
                return Result<string>.BadRequest($"Password reset failed: {errors}");
            }

            tokenRecord.UsedAt = DateTime.UtcNow;
            _unitOfWork.BaseRepository<PasswordResetToken>().Update(tokenRecord);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<string>.Success("Password reset successful.");
        }
    }
}
