namespace Leibniz.Api.Topics.Endpoints;
public class GetTopicEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-topic", Handle)
        .Produces<GetTopicResponse>()
        .WithSummary("Retrieve a set of topics from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetTopicRequest(long TopicId);
    public record GetTopicResponse(Topic Topic);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetTopicRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var topic = await database.Topics.FindAsync(request.TopicId);
        return TypedResults.Ok(new GetTopicResponse(topic));
    }

    // Validations
    public class Validator : AbstractValidator<GetTopicRequest>
    {
        public Validator()
        {
            RuleFor(x => x.TopicId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


