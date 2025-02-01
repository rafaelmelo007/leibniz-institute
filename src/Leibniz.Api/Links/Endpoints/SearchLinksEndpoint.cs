namespace Leibniz.Api.Links.Endpoints;
public class SearchLinksEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-links", Handle)
        .Produces<ResultSet<SearchLinkRead>>()
        .WithSummary("Search a set of links from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record SearchLinksRequest(int Index, int Limit, EntityType Type, long Id, bool Primary = false);
    public record SearchLinkRead(long LinkId, string? Name, string? Content, string? Url, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] IRelationshipService relationshipService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] SearchLinksRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var linkIds = (await relationshipService.GetRelatedEntitiesAsync(request.Type,
            new List<long> { request.Id }, request.Primary, default, default, cancellationToken))
            .Where(x => x.Type == EntityType.Link).Select(x => x.Id).ToList();

        var query = database.Links.AsQueryable();
        var rows = await query.Where(x => linkIds.Contains(x.LinkId))
            .OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = await query.CountAsync();

        var ids = rows.Select(x => x.LinkId).ToList();
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Link && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var links = rows.Select(x => new SearchLinkRead
        (
            LinkId: x.LinkId,
            Name: x.Name,
            Content: x.Content,
            Url: x.Url,
            ImageFileName: images.ContainsKey(x.LinkId) ? images[x.LinkId] : default
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<SearchLinkRead>
            {
                Data = links,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Type = request.Type,
                Id = request.Id,
                IsPrimary = request.Primary
            });
    }

    // Validations
    public class Validator : AbstractValidator<SearchLinksRequest>
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

