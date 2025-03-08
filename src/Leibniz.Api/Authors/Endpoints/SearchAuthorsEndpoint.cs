namespace Leibniz.Api.Authors.Endpoints;
public class SearchAuthorsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-authors", Handle)
        .Produces<ResultSet<SearchAuthorsRead>>()
        .WithSummary("Search a set of authors from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record SearchAuthorsRequest(int Index, int Limit, EntityType Type, long Id, bool Primary = false);
    public record SearchAuthorsRead(long AuthorId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] IRelationshipService relationshipService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] SearchAuthorsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var authorIds = (await relationshipService.GetRelatedEntitiesAsync(request.Type,
            new List<long> { request.Id }, request.Primary, default, default, cancellationToken))
            .Where(x => x.Type == EntityType.Author).Select(x => x.Id).ToList();

        var query = database.Authors.AsNoTracking().AsQueryable();
        var rows = await query.Where(x => authorIds.Contains(x.AuthorId))
            .OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = await query.CountAsync();
        var ids = rows.Select(x => x.AuthorId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Author &&
            ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var authors = rows.Select(x => new SearchAuthorsRead
        (
            AuthorId: x.AuthorId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.AuthorId) ? images[x.AuthorId] : default
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<SearchAuthorsRead>
            {
                Data = authors,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Type = request.Type,
                Id = request.Id,
                IsPrimary = request.Primary
            });
    }

    // Validations
    public class Validator : AbstractValidator<SearchAuthorsRequest>
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


