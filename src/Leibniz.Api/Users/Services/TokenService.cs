using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Leibniz.Api.Users.Services;
public class TokenService : ITokenService
{
    private readonly AuthenticationConfiguration _config;

    public TokenService(IOptions<AuthenticationConfiguration> config)
    {
        _config = config.Value;
    }

    public async Task<TokenResult> GenerateJwtTokenAsync(User user, CancellationToken cancellationToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config.SigningKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Sid, user.Cpf),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.PrimarySid, user.UserId.ToString()),
        }),
            Expires = DateTime.UtcNow.AddMinutes(_config.ExpirationInMinutes),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        var result = new TokenResult
        {
            AccessToken = tokenString,
            TokenType = "Bearer",
            ExpiresIn = _config.ExpirationInMinutes
        };

        return result;
    }
}
