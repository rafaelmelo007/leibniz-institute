namespace Leibniz.Api.Charts.Endpoints;
public class RemoveChartEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-chart", Handle)
        .Produces<RemoveChartResponse>()
        .WithSummary("Delete an existing chart from the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record RemoveChartRequest(long ChartId);
    public record RemoveChartResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemoveChartRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] RemoveChartRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Charts.SingleOrDefaultAsync(x => x.ChartId == request.ChartId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Chart '{request.ChartId}' not found");
            return notifications.ToBadRequest();
        }

        database.Charts.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveChartResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveChartRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ChartId)
                .GreaterThan(0);
        }
    }
}




