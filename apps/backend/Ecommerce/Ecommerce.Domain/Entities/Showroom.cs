namespace Ecommerce.Domain.Entities
{
    public class Showroom : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Region { get; set; } = "HCM"; // HCM, HN, DN, CT, Other
        private string _city = string.Empty;
        public string City
        {
            get => _city;
            set
            {
                _city = value;
                if (string.IsNullOrEmpty(_province))
                {
                    _province = value;
                }
            }
        }

        private string? _province;
        public string Province
        {
            get => !string.IsNullOrEmpty(_province) ? _province : _city;
            set
            {
                _province = value;
                if (string.IsNullOrEmpty(_city))
                {
                    _city = value;
                }
            }
        }
        public string District { get; set; } = string.Empty;
        public string? Ward { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = "1800 6868";
        public string OpeningHours { get; set; } = "08:00 - 21:30";
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? GoogleMapIframeUrl { get; set; }
        public bool IsFlagship { get; set; } = false;
        public bool HasInstantPickup { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        // Navigation properties
        public virtual ICollection<ShowroomInventory> Inventories { get; set; } = new List<ShowroomInventory>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
