namespace Ecommerce.Application.Common.Models
{
    public class OptionGroup
    {
        public string Label { get; set; } = string.Empty;
        public List<Option> Options { get; set; } = new List<Option>();
    }
}

