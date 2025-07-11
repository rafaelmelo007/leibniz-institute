using Leibniz.Api.Nodes.Endpoints;

namespace Leibniz.Api.Nodes;
public static class Setup
{
    public static void MapNodeEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/nodes")
            .WithTags("Node")
            .RequireAuthorization()
            .MapEndpoint<GetOrAddNodeEndpoint>()
            .MapEndpoint<UpdateChartEndpoint>()
            .MapEndpoint<DeleteNodeBranchEndpoint>();
    }
}

