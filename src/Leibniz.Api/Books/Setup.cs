using Leibniz.Api.Books.Endpoints;

namespace Leibniz.Api.Books;
public static class Setup
{
    public static void MapBookEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/books")
            .WithTags("Books")
            .RequireAuthorization()
            .MapEndpoint<GetBooksEndpoint>()
            .MapEndpoint<GetBookEndpoint>()
            .MapEndpoint<AddBookEndpoint>()
            .MapEndpoint<UpdateBookEndpoint>()
            .MapEndpoint<RemoveBookEndpoint>();
    }
}

