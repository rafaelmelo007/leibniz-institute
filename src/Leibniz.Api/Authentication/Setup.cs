using Leibniz.Api.Authentication.Endpoints;

namespace Leibniz.Api.Authentication;
public static class Setup
{
    public static void MapAuthenticationEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/auth")
            .WithTags("Authentication")
            .RequireAuthorization()
            .MapEndpoint<SignInEndpoint>()
            .MapEndpoint<SignOutEndpoint>()
            .MapEndpoint<MeEndpoint>()
            .MapEndpoint<RegisterEndpoint>();
    }
}
