namespace Leibniz.Api.Charts.Endpoints;
public class AddChartEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-chart", Handle)
        .Produces<AddChartResponse>()
        .WithSummary("Add a new chart into the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record AddChartRequest(string Name, string Content);
    public record AddChartResponse(long ChartId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddChartRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddChartRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Charts.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Chart '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Chart
        {
            Name = request.Name,
            Content = request.Content,
        };
        await database.Charts.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddChartResponse(entry.ChartId));
    }

    // Validations
    public class Validator : AbstractValidator<AddChartRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}




