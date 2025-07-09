namespace Leibniz.Api.Users.Services;
public interface ITokenService
{
    Task<TokenResult> GenerateJwtTokenAsync(User user, CancellationToken cancellationToken);
}
