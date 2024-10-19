namespace Leibniz.Api.Authentication.Services;
public interface ITokenService
{
    string GenerateJwtToken(User user);
}
