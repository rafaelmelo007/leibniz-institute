using Leibniz.Api.Topics.Endpoints;

namespace Leibniz.Api.Topics;
public static class Setup
{
    public static void MapTopicsEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/topics")
            .WithTags("Topics")
            .RequireAuthorization()
            .MapEndpoint<ListTopicsEndpoint>()
            .MapEndpoint<GetTopicEndpoint>()
            .MapEndpoint<AddTopicEndpoint>()
            .MapEndpoint<UpdateTopicEndpoint>()
            .MapEndpoint<RemoveTopicEndpoint>()
            .MapEndpoint<SearchTopicsEndpoint>();
    }
}

