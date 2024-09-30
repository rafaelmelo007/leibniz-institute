namespace Leibniz.Api.Periods.Endpoints;
public class AddPeriodEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-period", Handle)
        .Produces<AddPeriodResponse>()
        .WithSummary("Add a new period into the database");

    // Request / Response
    public record AddPeriodRequest(int Type, string Name, string Content);
    public record AddPeriodResponse(long PeriodId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddPeriodRequest> validator,
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [FromBody] AddPeriodRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Periods.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Period '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Period
        {
            Name = request.Name,
            Content = request.Content,
        };
        await database.Periods.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddPeriodResponse(entry.PeriodId));
    }

    // Validations
    public class Validator : AbstractValidator<AddPeriodRequest>
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



