namespace Leibniz.Api.Topics.Endpoints;
public class UpdateTopicEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-topic", Handle)
        .Produces<UpdateTopicResponse>()
        .WithSummary("Update an existing topic in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdateTopicRequest(long TopicId, string Name, string Content);
    public record UpdateTopicResponse(long TopicId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdateTopicRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdateTopicRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Topics.AnyAsync(x => x.Name == request.Name && x.TopicId != request.TopicId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Topic '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Topics.SingleAsync(x => x.TopicId == request.TopicId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateTopicResponse(entry.TopicId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateTopicRequest>
    {
        public Validator()
        {
            RuleFor(x => x.TopicId)
                .GreaterThan(0);
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}





