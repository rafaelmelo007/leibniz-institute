namespace Leibniz.Api.Authentication;
public class AuthenticationConfiguration
{
    public string SigningKey { get; set; }
    public int ExpirationInMinutes { get; set; } = 3600;
}
