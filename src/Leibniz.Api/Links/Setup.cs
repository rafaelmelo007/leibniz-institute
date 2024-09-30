using Leibniz.Api.Links.Endpoints;

namespace Leibniz.Api.Links;
public static class Setup
{
    public static void MapLinkEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/links")
            .WithTags("Links")
            .RequireAuthorization()
            .MapEndpoint<GetLinksEndpoint>()
            .MapEndpoint<GetLinkEndpoint>()
            .MapEndpoint<AddLinkEndpoint>()
            .MapEndpoint<UpdateLinkEndpoint>()
            .MapEndpoint<RemoveLinkEndpoint>();
    }
}

