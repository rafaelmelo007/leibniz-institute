namespace Leibniz.Api.Topics.Endpoints;
public class SearchTopicsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-topics", Handle)
        .Produces<ResultSet<SearchTopicRead>>()
        .WithSummary("Search a set of topics from database");

    // Request / Response
    public record SearchTopicsRequest(int Index, int Limit, EntityType Type, long Id, bool Primary = false);
    public record SearchTopicRead(long TopicId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] IRelationshipService relationshipService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] SearchTopicsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var topicIds = (await relationshipService.GetRelatedEntitiesAsync(request.Type,
            new List<long> { request.Id }, request.Primary, default, default, cancellationToken))
            .Where(x => x.Type == EntityType.Topic).Select(x => x.Id).ToList();

        var query = database.Topics.AsQueryable();
        var rows = await query.Where(x => topicIds.Contains(x.TopicId))
            .OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = await query.CountAsync();

        var ids = rows.Select(x => x.TopicId).ToList();
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Topic && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var topics = rows.Select(x => new SearchTopicRead
        (
            TopicId: x.TopicId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.TopicId) ? images[x.TopicId] : default
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<SearchTopicRead>
            {
                Data = topics,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Type = request.Type,
                Id = request.Id,
                IsPrimary = request.Primary
            });
    }

    // Validations
    public class Validator : AbstractValidator<SearchTopicsRequest>
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


