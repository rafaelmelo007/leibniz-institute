namespace Leibniz.Api.Charts.Endpoints;
public class GetChartEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-chart", Handle)
        .Produces<GetChartResponse>()
        .WithSummary("Retrieve a chart from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetChartRequest(long ChartId);
    public record GetChartResponse(Chart Chart);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetChartRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var chart = await database.Charts.FindAsync(request.ChartId);
        return TypedResults.Ok(new GetChartResponse(chart));
    }

    // Validations
    public class Validator : AbstractValidator<GetChartRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ChartId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


