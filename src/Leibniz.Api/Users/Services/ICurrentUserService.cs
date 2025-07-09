namespace Leibniz.Api.Users.Services;
public interface ICurrentUserService
{
    public bool IsAuthenticated { get; }
    public long? UserId { get; }
}
