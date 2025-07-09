using Leibniz.Api.Charts.Endpoints;

namespace Leibniz.Api.Charts;
public static class Setup
{
    public static void MapChartEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/charts")
            .WithTags("Charts")
            .RequireAuthorization()
            .MapEndpoint<ListChartsEndpoint>()
            .MapEndpoint<GetChartEndpoint>()
            .MapEndpoint<AddChartEndpoint>()
            .MapEndpoint<UpdateChartEndpoint>()
            .MapEndpoint<RemoveChartEndpoint>()
            .MapEndpoint<SearchChartsEndpoint>();
    }
}

