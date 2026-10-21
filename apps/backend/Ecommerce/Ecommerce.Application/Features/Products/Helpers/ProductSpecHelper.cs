using Ecommerce.Domain.Entities;
using System.Text.RegularExpressions;

namespace Ecommerce.Application.Features.Products.Helpers
{
    public static class ProductSpecHelper
    {
        private static readonly Regex ChipRegex = new(
            @"\b(M[1-4]\s*(?:Pro|Max)?|A1[5-8]\s*(?:Pro(?:\s*Max)?)?|Snapdragon\s*\d+|Ryzen\s*\d|Core\s*Ultra\s*\d)\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex StorageRegex = new(
            @"\b(\d{1,3}GB(?:\/\d{1,2}TB)?|\d{1,2}TB)\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public static List<string> ExtractKeySpecs(
            IEnumerable<ProductSpecification>? specifications,
            string? productName = null,
            string? categoryName = null)
        {
            var chips = new List<string>();

            if (specifications != null)
            {
                var specList = specifications.ToList();

                // 1. Core highlighted key specs
                var keySpecs = specList
                    .Where(s => s.IsKeySpec && !string.IsNullOrWhiteSpace(s.Value))
                    .OrderBy(s => s.DisplayOrder)
                    .Select(s => s.Value.Trim())
                    .ToList();

                foreach (var val in keySpecs)
                {
                    if (chips.Count >= 2) break;
                    if (!chips.Contains(val, StringComparer.OrdinalIgnoreCase))
                    {
                        chips.Add(val);
                    }
                }

                // 2. Other specifications if fewer than 2
                if (chips.Count < 2)
                {
                    var otherSpecs = specList
                        .Where(s => !string.IsNullOrWhiteSpace(s.Value))
                        .OrderBy(s => s.DisplayOrder)
                        .Select(s => s.Value.Trim());

                    foreach (var val in otherSpecs)
                    {
                        if (chips.Count >= 2) break;
                        if (!chips.Contains(val, StringComparer.OrdinalIgnoreCase))
                        {
                            chips.Add(val);
                        }
                    }
                }
            }

            // 3. Fallback regex extraction from product name (matching frontend ProductCard)
            if (chips.Count < 2 && !string.IsNullOrWhiteSpace(productName))
            {
                var matchChip = ChipRegex.Match(productName);
                if (matchChip.Success && !chips.Contains(matchChip.Value, StringComparer.OrdinalIgnoreCase))
                {
                    chips.Add(matchChip.Value);
                }

                if (chips.Count < 2)
                {
                    var matchStorage = StorageRegex.Match(productName);
                    if (matchStorage.Success && !chips.Contains(matchStorage.Value, StringComparer.OrdinalIgnoreCase))
                    {
                        chips.Add(matchStorage.Value);
                    }
                }
            }

            // 4. Fallback defaults
            if (chips.Count == 0)
            {
                if (!string.IsNullOrWhiteSpace(categoryName))
                {
                    chips.Add(categoryName.Trim());
                }
                chips.Add("Bảo hành 24T chính hãng");
            }
            else if (chips.Count == 1)
            {
                chips.Add("Bảo hành 24T chính hãng");
            }

            return chips.Take(2).ToList();
        }
    }
}
