namespace Leibniz.Api.Charts.Endpoints;
public class SearchChartsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-charts", Handle)
        .Produces<ResultSet<SearchChartRead>>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Search some charts from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record SearchChartsRequest(int Index, int Limit, EntityType Type, long Id,
        bool Primary = false, EntityType? FilterType = default, long? FilterId = default);
    public record SearchChartRead(long ChartId, string? Name, string? Content, IEnumerable<RelatedEntity> Refs);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] SearchChartsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var postIds = (await relationshipService.GetRelatedEntitiesAsync(request.Type,
            new List<long> { request.Id }, request.Primary, request.FilterType, request.FilterId,
            cancellationToken))
            .Where(x => x.Type == EntityType.Post).Select(x => x.Id).ToList();

        var query = database.Charts.AsNoTracking().AsQueryable();
        var rows = await query.Where(x => postIds.Contains(x.ChartId))
            .OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = rows.Count();
        var ids = rows.Select(x => x.ChartId).ToList();
        var refs = await relationshipService.GetRelatedEntitiesAsync(EntityType.Post, ids,
            false, default, default, cancellationToken);
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Post && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var posts = rows.Select(x => new SearchChartRead
        (
            ChartId: x.ChartId,
            Name: x.Name,
            Content: x.Content,
            Refs: refs.Where(x2 => x2.AssignedIds.Contains(x.ChartId))
                    .Select(x2 => new RelatedEntity
                    {
                        Type = x2.Type,
                        Id = x2.Id,
                        Name = x2.Name
                    }).ToList()
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<SearchChartRead>
            {
                Data = posts,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Type = request.Type,
                Id = request.Id,
                FilterType = request.FilterType,
                FilterId = request.FilterId,
                IsPrimary = request.Primary
            });
    }

    // Validations
    public class Validator : AbstractValidator<SearchChartsRequest>
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


