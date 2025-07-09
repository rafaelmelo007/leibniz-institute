namespace Leibniz.Api.Charts.Endpoints;
public class UpdateChartEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-chart", Handle)
        .Produces<UpdateChartResponse>()
        .WithSummary("Update an existing chart in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdateChartRequest(long ChartId, string Name, string Content);
    public record UpdateChartResponse(long ChartId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdateChartRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdateChartRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Charts.AnyAsync(x => x.Name == request.Name && x.ChartId != request.ChartId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Chart '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Charts.SingleAsync(x => x.ChartId == request.ChartId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateChartResponse(entry.ChartId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateChartRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ChartId)
                .GreaterThan(0);
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}





