namespace Leibniz.Api.Authors.Endpoints;
public class RemoveAuthorEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-author", Handle)
        .Produces<RemoveAuthorResponse>()
        .WithSummary("Delete an existing author in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record RemoveAuthorRequest(long AuthorId);
    public record RemoveAuthorResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] Validator validator,
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [AsParameters] RemoveAuthorRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Authors.SingleOrDefaultAsync(x => x.AuthorId == request.AuthorId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Author '{request.AuthorId}' not found");
            return notifications.ToBadRequest();
        }

        database.Authors.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveAuthorResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveAuthorRequest>
    {
        public Validator()
        {
            RuleFor(x => x.AuthorId)
                .GreaterThan(0);
        }
    }
}




