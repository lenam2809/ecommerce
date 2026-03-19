using System.Globalization;

namespace Ecommerce.Application.Common.Helpers
{
    public static class FormatHelper
    {
        private static readonly CultureInfo VietnamCulture = new("vi-VN");
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        /// <summary>
        /// Format tiền tệ theo VND (không có số thập phân mặc định).
        /// </summary>
        public static string ToVndCurrency(decimal amount, bool includeFraction = false)
        {
            return amount.ToString(includeFraction ? "C" : "C0", VietnamCulture);
        }

        /// <summary>
        /// Format phần trăm (vd: 0.123 => 12.3%)
        /// </summary>
        public static string ToPercentage(decimal value, int decimalPlaces = 1)
        {
            return (value * 100).ToString($"N{decimalPlaces}", VietnamCulture) + " %";
        }

        /// <summary>
        /// Format số lượng (có phân tách hàng nghìn, không có đơn vị).
        /// </summary>
        public static string ToQuantity(int quantity)
        {
            return quantity.ToString("N0", VietnamCulture);
        }

        /// <summary>
        /// Format ngày giờ theo giờ Việt Nam (UTC+7), mặc định định dạng "dd/MM/yyyy HH:mm".
        /// </summary>
        public static string ToVietnamDateTime(DateTime dateTimeUtc, string format = "dd/MM/yyyy HH:mm")
        {
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(dateTimeUtc, VietnamTimeZone);
            return vietnamTime.ToString(format, VietnamCulture);
        }

        /// <summary>
        /// Chuyển trạng thái đơn hàng thành tiếng Việt thân thiện.
        /// </summary>
        public static string FormatOrderStatus(string status)
        {
            return status.ToLower() switch
            {
                "pending" => "Chờ xác nhận",
                "processing" => "Đang xử lý",
                "shipped" => "Đã giao hàng",
                "cancelled" => "Đã hủy",
                "completed" => "Hoàn tất",
                _ => "Không xác định"
            };
        }
    }
}

