using Leibniz.Api.Relationships.Endpoints;

namespace Leibniz.Api.Relationships;
public static class Setup
{
    public static void MapRelationshipsEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/relationships")
            .WithTags("Relationships")
            .RequireAuthorization()
            .MapEndpoint<GetRelationshipsEndpoint>()
            .MapEndpoint<LookupEntitiesEndpoint>()
            .MapEndpoint<SaveRelationshipsEndpoint>()
            .MapEndpoint<MoveToEndpoint>();
    }
}

