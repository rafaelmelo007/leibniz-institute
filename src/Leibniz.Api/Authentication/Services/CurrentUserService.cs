namespace Leibniz.Api.Authentication.Services;
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _contextAccessor;

    public CurrentUserService(IHttpContextAccessor contextAccessor)
    {
        _contextAccessor = contextAccessor
            ?? throw new ArgumentNullException(nameof(contextAccessor));
    }

    public bool IsAuthenticated
    {
        get
        {
            if (_contextAccessor.HttpContext is null) return false;

            var user = _contextAccessor.HttpContext.User;
            var identity = user.Identity;
            return identity?.IsAuthenticated ?? false;
        }
    }

    public long? UserId
    {
        get
        {
            if (_contextAccessor.HttpContext is null) return null;

            var user = _contextAccessor.HttpContext.User;
            var identity = user.Identity;
            if (identity is null || !identity.IsAuthenticated) return null;

            var claim = user.FindFirst(f => f.Type == ClaimTypes.PrimarySid);
            if (claim is null) return default;
            if (!long.TryParse(claim.Value, out var id)) return null;

            return id;
        }
    }
}