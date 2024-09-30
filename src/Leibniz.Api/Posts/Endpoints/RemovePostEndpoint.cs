namespace Leibniz.Api.Posts.Endpoints;
public class RemovePostEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-post", Handle)
        .Produces<RemovePostResponse>()
        .WithSummary("Delete an existing post from the database");

    // Request / Response
    public record RemovePostRequest(long PostId);
    public record RemovePostResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemovePostRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [AsParameters] RemovePostRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Posts.SingleOrDefaultAsync(x => x.PostId == request.PostId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Post '{request.PostId}' not found");
            return notifications.ToBadRequest();
        }

        database.Posts.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemovePostResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemovePostRequest>
    {
        public Validator()
        {
            RuleFor(x => x.PostId)
                .GreaterThan(0);
        }
    }
}




