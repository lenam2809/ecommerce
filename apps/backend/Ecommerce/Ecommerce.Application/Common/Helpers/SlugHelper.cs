using System.Text;
using System.Text.RegularExpressions;

namespace Ecommerce.Application.Common.Helpers
{
    public static class SlugHelper
    {
        private static readonly Dictionary<char, string> VietnameseCharacterMap = new()
        {
            {'à', "a"}, {'á', "a"}, {'ả', "a"}, {'ã', "a"}, {'ạ', "a"},
            {'ă', "a"}, {'ằ', "a"}, {'ắ', "a"}, {'ẳ', "a"}, {'ẵ', "a"}, {'ặ', "a"},
            {'â', "a"}, {'ầ', "a"}, {'ấ', "a"}, {'ẩ', "a"}, {'ẫ', "a"}, {'ậ', "a"},
            {'è', "e"}, {'é', "e"}, {'ẻ', "e"}, {'ẽ', "e"}, {'ẹ', "e"},
            {'ê', "e"}, {'ề', "e"}, {'ế', "e"}, {'ể', "e"}, {'ễ', "e"}, {'ệ', "e"},
            {'ì', "i"}, {'í', "i"}, {'ỉ', "i"}, {'ĩ', "i"}, {'ị', "i"},
            {'ò', "o"}, {'ó', "o"}, {'ỏ', "o"}, {'õ', "o"}, {'ọ', "o"},
            {'ô', "o"}, {'ồ', "o"}, {'ố', "o"}, {'ổ', "o"}, {'ỗ', "o"}, {'ộ', "o"},
            {'ơ', "o"}, {'ờ', "o"}, {'ớ', "o"}, {'ở', "o"}, {'ỡ', "o"}, {'ợ', "o"},
            {'ù', "u"}, {'ú', "u"}, {'ủ', "u"}, {'ũ', "u"}, {'ụ', "u"},
            {'ư', "u"}, {'ừ', "u"}, {'ứ', "u"}, {'ử', "u"}, {'ữ', "u"}, {'ự', "u"},
            {'ỳ', "y"}, {'ý', "y"}, {'ỷ', "y"}, {'ỹ', "y"}, {'ỵ', "y"},
            {'đ', "d"},
            {'À', "A"}, {'Á', "A"}, {'Ả', "A"}, {'Ã', "A"}, {'Ạ', "A"},
            {'Ă', "A"}, {'Ằ', "A"}, {'Ắ', "A"}, {'Ẳ', "A"}, {'Ẵ', "A"}, {'Ặ', "A"},
            {'Â', "A"}, {'Ầ', "A"}, {'Ấ', "A"}, {'Ẩ', "A"}, {'Ẫ', "A"}, {'Ậ', "A"},
            {'È', "E"}, {'É', "E"}, {'Ẻ', "E"}, {'Ẽ', "E"}, {'Ẹ', "E"},
            {'Ê', "E"}, {'Ề', "E"}, {'Ế', "E"}, {'Ể', "E"}, {'Ễ', "E"}, {'Ệ', "E"},
            {'Ì', "I"}, {'Í', "I"}, {'Ỉ', "I"}, {'Ĩ', "I"}, {'Ị', "I"},
            {'Ò', "O"}, {'Ó', "O"}, {'Ỏ', "O"}, {'Õ', "O"}, {'Ọ', "O"},
            {'Ô', "O"}, {'Ồ', "O"}, {'Ố', "O"}, {'Ổ', "O"}, {'Ỗ', "O"}, {'Ộ', "O"},
            {'Ơ', "O"}, {'Ờ', "O"}, {'Ớ', "O"}, {'Ở', "O"}, {'Ỡ', "O"}, {'Ợ', "O"},
            {'Ù', "U"}, {'Ú', "U"}, {'Ủ', "U"}, {'Ũ', "U"}, {'Ụ', "U"},
            {'Ư', "U"}, {'Ừ', "U"}, {'Ứ', "U"}, {'Ử', "U"}, {'Ữ', "U"}, {'Ự', "U"},
            {'Ỳ', "Y"}, {'Ý', "Y"}, {'Ỷ', "Y"}, {'Ỹ', "Y"}, {'Ỵ', "Y"},
            {'Đ', "D"}
        };

        public static string GenerateSlug(string phrase)
        {
            if (string.IsNullOrEmpty(phrase))
                return string.Empty;

            // Bước 1: Chuyển đổi ký tự tiếng Việt
            string str = ConvertVietnameseCharacters(phrase.ToLower());

            // Bước 2: Xóa các ký tự không hợp lệ (giữ a-z, 0-9, khoảng trắng, dấu gạch)
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");

            // Bước 3: Thay thế khoảng trắng bằng dấu gạch ngang
            str = Regex.Replace(str, @"\s+", "-").Trim('-');

            // Bước 4: Loại bỏ dấu gạch ngang thừa
            str = Regex.Replace(str, @"-+", "-");

            return str;
        }

        private static string ConvertVietnameseCharacters(string text)
        {
            StringBuilder result = new StringBuilder();
            foreach (char c in text)
            {
                if (VietnameseCharacterMap.TryGetValue(c, out string replacement))
                {
                    result.Append(replacement);
                }
                else
                {
                    result.Append(c);
                }
            }
            return result.ToString();
        }
    }
}
