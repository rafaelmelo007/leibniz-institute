using Leibniz.Api.Posts.Endpoints;

namespace Leibniz.Api.Posts;
public static class Setup
{
    public static void MapPostEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/posts")
            .WithTags("Posts")
            .RequireAuthorization()
            .MapEndpoint<ListPostsEndpoint>()
            .MapEndpoint<GetPostEndpoint>()
            .MapEndpoint<AddPostEndpoint>()
            .MapEndpoint<UpdatePostEndpoint>()
            .MapEndpoint<RemovePostEndpoint>()
            .MapEndpoint<SearchPostsEndpoint>()
            .MapEndpoint<AddBatchPostsEndpoint>();
    }
}

