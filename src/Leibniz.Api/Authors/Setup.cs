using Leibniz.Api.Authors.Endpoints;

namespace Leibniz.Api.Authors;
public static class Setup
{
    public static void MapAuthorsEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/authors")
            .WithTags("Authors")
            .RequireAuthorization()
            .MapEndpoint<GetAuthorsEndpoint>()
            .MapEndpoint<GetAuthorEndpoint>()
            .MapEndpoint<AddAuthorEndpoint>()
            .MapEndpoint<UpdateAuthorEndpoint>()
            .MapEndpoint<RemoveAuthorEndpoint>();
    }
}

