namespace Leibniz.Api.Theses.Endpoints;
public class RemoveThesisEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-thesis", Handle)
        .Produces<RemoveThesisResponse>()
        .WithSummary("Delete an existing thesis in the database");

    // Request / Response
    public record RemoveThesisRequest(long ThesisId);
    public record RemoveThesisResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemoveThesisRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] RemoveThesisRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Theses.SingleOrDefaultAsync(x => x.ThesisId == request.ThesisId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Thesis '{request.ThesisId}' not found");
            return notifications.ToBadRequest();
        }

        database.Theses.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveThesisResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveThesisRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ThesisId)
                .GreaterThan(0);
        }
    }
}




