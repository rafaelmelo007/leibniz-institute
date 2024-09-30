namespace Leibniz.Api.Authentication;
public static class UserExtension
{
    public static string? GetEmail(this ClaimsPrincipal user)
    {
        if (user?.Identity is null) return default;
        if (!user.Identity.IsAuthenticated) return default;

        var claim = user.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
        return claim?.Value;
    }

    public static long? GetUserId(this ClaimsPrincipal user)
    {
        if (user?.Identity is null) return default;
        if (!user.Identity.IsAuthenticated) return default;

        var claim = user.Claims.FirstOrDefault(x => x.Type == ClaimTypes.PrimarySid);
        if (long.TryParse(claim?.Value, out long userId)) return userId;

        return default;
    }
}
