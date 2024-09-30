using Leibniz.Api.Periods.Endpoints;

namespace Leibniz.Api.Periods;
public static class Setup
{
    public static void MapPeriodsEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/periods")
            .WithTags("Periods")
            .RequireAuthorization()
            .MapEndpoint<GetPeriodsEndpoint>()
            .MapEndpoint<GetPeriodEndpoint>()
            .MapEndpoint<AddPeriodEndpoint>()
            .MapEndpoint<UpdatePeriodEndpoint>()
            .MapEndpoint<RemovePeriodEndpoint>();
    }
}

