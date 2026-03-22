namespace Ecommerce.Application.Common.Configs
{
    public class SupabaseStorageConfig
    {
        public string Url { get; set; } = string.Empty;
        public string ServiceRoleKey { get; set; } = string.Empty;
        public string BucketName { get; set; } = "ecommerce-uploads";
    }
}
