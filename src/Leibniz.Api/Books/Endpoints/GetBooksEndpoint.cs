namespace Leibniz.Api.Books.Endpoints;
public class GetBooksEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-books", Handle)
        .Produces<GetBooksResponse>()
        .WithSummary("Retrieve a set of books from database");

    // Request / Response
    public record GetBooksRequest(int Index, int Limit, string Query);
    public record GetBooksResponse(IEnumerable<BookRead> Data, int Index, int Limit, int Count);
    public record BookRead(long BookId, string? Title, string? Author, string? Publisher, short? Edition, short? Year, short? TotalOfPages, string? Isbn, string? Local, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] ICurrentUserService currentUserService,
        [AsParameters] GetBooksRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var userId = currentUserService.UserId;

        var query = database.Books.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Title.Contains(request.Query) || x.Content.Contains(request.Query) || x.Author.Contains(request.Query));
        }

        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        var ids = rows.Select(x => x.BookId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Book && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        return TypedResults.Ok(new GetBooksResponse(rows.Select(x => new BookRead
        (
            BookId: x.BookId,
            Title: x.Title,
            Author: x.Author,
            Publisher: x.Publisher,
            Edition: x.Edition,
            Year: x.Year,
            TotalOfPages: x.TotalOfPages,
            Isbn: x.Isbn,
            Local: x.Local,
            ImageFileName: images.ContainsKey(x.BookId) ? images[x.BookId] : default
        )), request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetBooksRequest>
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


