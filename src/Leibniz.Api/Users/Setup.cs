using Leibniz.Api.Users.Endpoints;

namespace Leibniz.Api.Users;
public static class Setup
{
    public static void MapAuthenticationEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/users")
            .WithTags("User")
            .RequireAuthorization()
            .MapEndpoint<SignInEndpoint>()
            .MapEndpoint<SignOutEndpoint>()
            .MapEndpoint<MeEndpoint>()
            .MapEndpoint<RegisterEndpoint>()
            .MapEndpoint<ForgotPasswordSendMailEndpoint>()
            .MapEndpoint<ForgotPasswordResetEndpoint>();
    }
}
