namespace Ecommerce.Application.Common.Configs
{
    public class JwtConfig
    {
        public required string SecretKey { get; set; }
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public int AccessTokenExpirationMinutes { get; set; }
    }
}

