namespace Ecommerce.Infrastructure.Payments.VnPay;

public sealed class VnPaySettings
{
    public string TmnCode { get; set; } = string.Empty;
    public string HashSecret { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = string.Empty;
    public string Version { get; set; } = "2.1.0";
}
