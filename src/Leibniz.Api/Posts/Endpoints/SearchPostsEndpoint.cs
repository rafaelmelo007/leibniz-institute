namespace Leibniz.Api.Posts.Endpoints;
public class SearchPostsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-posts", Handle)
        .Produces<ResultSet<SearchPostRead>>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Search some posts from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record SearchPostsRequest(int Index, int Limit, EntityType Type, long Id,
        bool Primary = false, EntityType? FilterType = default, long? FilterId = default);
    public record SearchPostRead(long PostId, string? Title, string? Content, string? Author,
        long? BookId, string? BookName, int? Page, string ImageFileName, IEnumerable<RelatedEntity> Refs);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] SearchPostsRequest request,
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

        var query = database.Posts.AsNoTracking().AsQueryable();
        var rows = await query.Where(x => postIds.Contains(x.PostId)).OrderBy(x => x.Page)
            .ThenByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = rows.Count();
        var ids = rows.Select(x => x.PostId).ToList();
        var refs = await relationshipService.GetRelatedEntitiesAsync(EntityType.Post, ids,
            false, default, default, cancellationToken);
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Post && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var posts = rows.Select(x => new SearchPostRead
        (
            PostId: x.PostId,
            Title: x.Title,
            Content: x.Content,
            Author: x.Author,
            BookId: x.BookId,
            BookName: x.BookId != null && x.BookId.Value > 0 ?
                relationshipService.GetRelationshipName(EntityType.Book, x.BookId.Value) : default,
            Page: x.Page,
            ImageFileName: images.ContainsKey(x.PostId) ? images[x.PostId] : default,
            Refs: refs.Where(x2 => x2.AssignedIds.Contains(x.PostId))
                    .Select(x2 => new RelatedEntity
                    {
                        Type = x2.Type,
                        Id = x2.Id,
                        Name = x2.Name
                    }).ToList()
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<SearchPostRead>
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
    public class Validator : AbstractValidator<SearchPostsRequest>
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


