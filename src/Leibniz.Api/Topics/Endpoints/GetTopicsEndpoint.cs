namespace Leibniz.Api.Topics.Endpoints;
public class GetTopicsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-topics", Handle)
        .Produces<GetTopicsResponse>()
        .WithSummary("Retrieve a set of topics from database");

    // Request / Response
    public record GetTopicsRequest(int Index, int Limit, string Query);
    public record GetTopicsResponse(IEnumerable<TopicRead> Data, int Index, int Limit, int Count);
    public record TopicRead(long TopicId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetTopicsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Topics.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query) || x.Content.Contains(request.Query));
        }


        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();

        var ids = rows.Select(x => x.TopicId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Topic && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var topics = rows.Select(x => new TopicRead
        (
            TopicId: x.TopicId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.TopicId) ? images[x.TopicId] : default
        ));
        return TypedResults.Ok(new GetTopicsResponse(topics, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetTopicsRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Index)
                .GreaterThanOrEqualTo(0);
            RuleFor(x => x.Limit)
                .GreaterThan(0)
                .LessThan(500);
        }
    }
}


