using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Extensions
{
    public static class LogLevelExtensions
    {
        public static string ToFriendlyString(this ELogLevel level)
        {
            return level switch
            {
                ELogLevel.Trace => "Theo Dõi Chi Tiết",
                ELogLevel.Debug => "Gỡ Lỗi",
                ELogLevel.Information => "Thông Tin",
                ELogLevel.Warning => "Cảnh Báo",
                ELogLevel.Error => "Lỗi",
                ELogLevel.Critical => "Lỗi Nghiêm Trọng",
                _ => "Không Xác Định"
            };
        }

        public static bool IsCritical(this ELogLevel level)
        {
            return level >= ELogLevel.Error;
        }
    }
}

