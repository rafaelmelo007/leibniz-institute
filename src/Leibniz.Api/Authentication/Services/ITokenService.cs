namespace Leibniz.Api.Authentication.Services;
public interface ITokenService
{
    Task<TokenResult> GenerateJwtTokenAsync(User user, CancellationToken cancellationToken);
}
