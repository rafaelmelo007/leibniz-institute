namespace Leibniz.Api.Periods.Endpoints;
public class UpdatePeriodEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-period", Handle)
        .Produces<UpdatePeriodResponse>()
        .WithSummary("Update an existing period in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdatePeriodRequest(long PeriodId, string Name, string Content,
        short? BeginYear, short? EndYear, short? BeginMonth, short? EndMonth,
        short? BeginDay, short? EndDay);
    public record UpdatePeriodResponse(long PeriodId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdatePeriodRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdatePeriodRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Periods.AnyAsync(x => x.Name == request.Name && x.PeriodId != request.PeriodId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Period '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Periods.SingleAsync(x => x.PeriodId == request.PeriodId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;
        entry.BeginYear = request.BeginYear;
        entry.EndYear = request.EndYear;
        entry.BeginMonth = request.BeginMonth;
        entry.EndMonth = request.EndMonth;
        entry.BeginDay = request.BeginDay;
        entry.EndDay = request.EndDay;

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdatePeriodResponse(entry.PeriodId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdatePeriodRequest>
    {
        public Validator()
        {
            RuleFor(x => x.PeriodId)
                .GreaterThan(0);
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}





