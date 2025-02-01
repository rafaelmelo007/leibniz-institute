namespace Leibniz.Api.Periods.Endpoints;
public class RemovePeriodEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-period", Handle)
        .Produces<RemovePeriodResponse>()
        .WithSummary("Delete an existing period in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record RemovePeriodRequest(long PeriodId);
    public record RemovePeriodResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemovePeriodRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] RemovePeriodRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Periods.SingleOrDefaultAsync(x => x.PeriodId == request.PeriodId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Period '{request.PeriodId}' not found");
            return notifications.ToBadRequest();
        }

        database.Periods.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemovePeriodResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemovePeriodRequest>
    {
        public Validator()
        {
            RuleFor(x => x.PeriodId)
                .GreaterThan(0);
        }
    }
}




