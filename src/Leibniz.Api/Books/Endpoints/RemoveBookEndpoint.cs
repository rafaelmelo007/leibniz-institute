namespace Leibniz.Api.Books.Endpoints;
public class RemoveBookEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-book", Handle)
        .Produces<RemoveBookResponse>()
        .WithSummary("Delete an existing book in the database");

    // Request / Response
    public record RemoveBookRequest(long BookId);
    public record RemoveBookResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemoveBookRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] RemoveBookRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Books.SingleOrDefaultAsync(x => x.BookId == request.BookId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Book '{request.BookId}' not found");
            return notifications.ToBadRequest();
        }

        database.Books.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveBookResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveBookRequest>
    {
        public Validator()
        {
            RuleFor(x => x.BookId)
                .GreaterThan(0);
        }
    }
}




