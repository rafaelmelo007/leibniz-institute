using Leibniz.Api.Theses.Endpoints;

namespace Leibniz.Api.Theses;
public static class Setup
{
    public static void MapThesesEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/theses")
            .WithTags("Theses")
            .RequireAuthorization()
            .MapEndpoint<ListThesesEndpoint>()
            .MapEndpoint<GetThesisEndpoint>()
            .MapEndpoint<AddThesisEndpoint>()
            .MapEndpoint<UpdateThesisEndpoint>()
            .MapEndpoint<RemoveThesisEndpoint>()
            .MapEndpoint<SearchThesesEndpoint>();
    }
}

