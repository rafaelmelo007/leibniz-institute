namespace Leibniz.Api.Periods.Endpoints;
public class GetPeriodEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-period", Handle)
        .Produces<GetPeriodResponse>()
        .WithSummary("Retrieve a period from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetPeriodRequest(long PeriodId);
    public record GetPeriodResponse(Period Period);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetPeriodRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var period = await database.Periods.FindAsync(request.PeriodId);
        return TypedResults.Ok(new GetPeriodResponse(period));
    }

    // Validations
    public class Validator : AbstractValidator<GetPeriodRequest>
    {
        public Validator()
        {
            RuleFor(x => x.PeriodId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


