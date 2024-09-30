using Leibniz.Api.Areas.Endpoints;

namespace Leibniz.Api.Areas;
public static class Setup
{
    public static void MapAreasEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/areas")
            .WithTags("Areas")
            .RequireAuthorization()
            .MapEndpoint<GetAreasEndpoint>()
            .MapEndpoint<GetAreaEndpoint>()
            .MapEndpoint<AddAreaEndpoint>()
            .MapEndpoint<UpdateAreaEndpoint>()
            .MapEndpoint<RemoveAreaEndpoint>();
    }
}

