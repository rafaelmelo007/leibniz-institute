namespace Leibniz.Api.Topics.Endpoints;
public class RemoveTopicEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-topic", Handle)
        .Produces<RemoveTopicResponse>()
        .WithSummary("Delete an existing topic in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record RemoveTopicRequest(long TopicId);
    public record RemoveTopicResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<RemoveTopicRequest> validator,
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [AsParameters] RemoveTopicRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Topics.SingleOrDefaultAsync(x => x.TopicId == request.TopicId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Topic '{request.TopicId}' not found");
            return notifications.ToBadRequest();
        }

        database.Topics.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveTopicResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveTopicRequest>
    {
        public Validator()
        {
            RuleFor(x => x.TopicId)
                .GreaterThan(0);
        }
    }
}




