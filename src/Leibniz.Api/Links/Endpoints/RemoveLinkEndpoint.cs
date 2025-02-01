namespace Leibniz.Api.Links.Endpoints;
public class RemoveLinkEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-link", Handle)
        .Produces<RemoveLinkResponse>()
        .WithSummary("Delete an existing link in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record RemoveLinkRequest(long LinkId);
    public record RemoveLinkResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemoveLinkRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] RemoveLinkRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Links.SingleOrDefaultAsync(x => x.LinkId == request.LinkId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Link '{request.LinkId}' not found");
            return notifications.ToBadRequest();
        }

        database.Links.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveLinkResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveLinkRequest>
    {
        public Validator()
        {
            RuleFor(x => x.LinkId)
                .GreaterThan(0);
        }
    }
}



