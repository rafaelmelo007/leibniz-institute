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
            .MapEndpoint<ListLinksEndpoint>()
            .MapEndpoint<GetLinkEndpoint>()
            .MapEndpoint<AddLinkEndpoint>()
            .MapEndpoint<UpdateLinkEndpoint>()
            .MapEndpoint<RemoveLinkEndpoint>()
            .MapEndpoint<SearchLinksEndpoint>();
    }
}

