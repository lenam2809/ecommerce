using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    public class MarqueeSetting
    {
        [Key]
        public int Id { get; set; }
        public bool IsEnabled { get; set; } = true;
    }
}
