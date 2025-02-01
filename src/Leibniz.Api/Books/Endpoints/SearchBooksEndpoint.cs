namespace Leibniz.Api.Books.Endpoints;
public class SearchBooksEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-books", Handle)
        .Produces<ResultSet<SearchBookRead>>()
        .WithSummary("Search a set of books from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record SearchBooksRequest(int Index, int Limit, EntityType Type, long Id, bool Primary = false);
    public record SearchBookRead(long BookId, string? Title, string Author, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] IRelationshipService relationshipService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] SearchBooksRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var booksIds = (await relationshipService.GetRelatedEntitiesAsync(request.Type,
            new List<long> { request.Id }, request.Primary, default, default, cancellationToken))
            .Where(x => x.Type == EntityType.Book).Select(x => x.Id).ToList();

        var query = database.Books.AsQueryable();
        var rows = await query.Where(x => booksIds.Contains(x.BookId))
            .OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = await query.CountAsync();

        var ids = rows.Select(x => x.BookId).ToList();
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Topic && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var topics = rows.Select(x => new SearchBookRead
        (
            BookId: x.BookId,
            Title: x.Title,
            Author: x.Author,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.BookId) ? images[x.BookId] : default
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<SearchBookRead>
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
    public class Validator : AbstractValidator<SearchBooksRequest>
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


