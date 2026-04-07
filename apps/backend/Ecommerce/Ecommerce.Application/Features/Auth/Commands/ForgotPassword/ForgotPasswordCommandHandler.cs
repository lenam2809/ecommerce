using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace Ecommerce.Application.Features.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public ForgotPasswordCommandHandler(
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Luôn trả về thành công để tránh tiết lộ email có tồn tại hay không (user enumeration prevention)
                var normalizedEmail = request.Email.Trim().ToLower();
                var user = await _unitOfWork.Users.GetByEmailAsync(normalizedEmail);

                if (user != null)
                {
                    // Xóa các token cũ chưa dùng của email này
                    var oldTokens = _unitOfWork.BaseRepository<PasswordResetToken>()
                        .GetQueryable()
                        .Where(t => t.Email == normalizedEmail && t.UsedAt == null);

                    foreach (var oldToken in oldTokens)
                    {
                        _unitOfWork.BaseRepository<PasswordResetToken>().Delete(oldToken);
                    }

                    // Tạo token ngẫu nhiên an toàn (256-bit entropy)
                    var tokenBytes = RandomNumberGenerator.GetBytes(32);
                    var token = Convert.ToBase64String(tokenBytes)
                        .Replace("+", "-").Replace("/", "_").Replace("=", ""); // URL-safe Base64

                    var resetToken = new PasswordResetToken
                    {
                        Email = normalizedEmail,
                        Token = token,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                    };

                    await _unitOfWork.BaseRepository<PasswordResetToken>().AddAsync(resetToken, cancellationToken);
                    await _unitOfWork.CompleteAsync(cancellationToken);

                    // Gửi email với link reset
                    var frontendUrl = _configuration["AppUrl:Frontend"] ?? "http://localhost:3000";
                    var resetLink = $"{frontendUrl}/reset-password?requestId={resetToken.Id:D}";

                    var htmlBody = BuildResetEmailHtml(user.FirstName ?? "Bạn", resetLink);
                    await _emailService.SendEmailAsync(
                        to: request.Email,
                        subject: "Đặt lại mật khẩu - ShopViet",
                        message: $"Nhấn vào link sau để đặt lại mật khẩu: {resetLink}",
                        htmlContent: htmlBody
                    );
                }

                // Luôn trả về Success bất kể email có tồn tại hay không
                return Result<string>.Success("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.");
            }
            catch (Exception ex)
            {
                // Log nhưng không lộ chi tiết lỗi ra ngoài
                return Result<string>.ServerError("Có lỗi xảy ra, vui lòng thử lại sau.");
            }
        }

        private static string BuildResetEmailHtml(string firstName, string resetLink)
        {
            return $"""
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Đặt lại mật khẩu</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
                              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ShopViet</h1>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <h2 style="color:#111827;font-size:20px;font-weight:600;margin:0 0 16px;">Xin chào, {firstName}!</h2>
                              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                                Nhấn vào nút bên dưới để tạo mật khẩu mới.
                              </p>
                              <div style="text-align:center;margin:32px 0;">
                                <a href="{resetLink}" 
                                   style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                                          color:#ffffff;text-decoration:none;padding:14px 32px;
                                          border-radius:10px;font-size:15px;font-weight:600;
                                          letter-spacing:0.3px;">
                                  Đặt lại mật khẩu
                                </a>
                              </div>
                              <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:0 0 12px;">
                                Link này sẽ hết hạn sau <strong>15 phút</strong>.
                              </p>
                              <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:0;">
                                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
                              <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                                © {DateTime.UtcNow.Year} ShopViet Inc. · 
                                <a href="{resetLink}" style="color:#6366f1;text-decoration:none;">Link trực tiếp</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;
        }
    }
}
