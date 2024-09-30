namespace Leibniz.Api.Authentication.Services;
public interface ICurrentUserService
{
    public bool IsAuthenticated { get; }
    public long? UserId { get; }
}
