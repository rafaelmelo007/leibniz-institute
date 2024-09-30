namespace Leibniz.Api.Topics.Endpoints;
public class AddTopicEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-topic", Handle)
        .Produces<AddTopicResponse>()
        .WithSummary("Add a new topic into the database");

    // Request / Response
    public record AddTopicRequest(int Type, string Name, string Content);
    public record AddTopicResponse(long TopicId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddTopicRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddTopicRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Topics.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Topic '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Topic
        {
            Name = request.Name,
            Content = request.Content,
        };
        await database.Topics.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddTopicResponse(entry.TopicId));
    }

    // Validations
    public class Validator : AbstractValidator<AddTopicRequest>
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



