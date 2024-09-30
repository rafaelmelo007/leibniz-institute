namespace Leibniz.Api.Books.Endpoints;
public class AddBookEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-book", Handle)
        .Produces<AddBookResponse>()
        .WithSummary("Add a new book into the database");

    // Request / Response
    public record AddBookRequest(string Title, string Author, string? Publisher, short? Edition, string? Isbn,
        short? TotalOfPages, decimal? Price, DateTime? PurchasedDate, string? Translator, short? Year, string? Local,
        decimal? SizeX, decimal? SizeY, decimal? SizeZ);
    public record AddBookResponse(long BookId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddBookRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddBookRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Books.AnyAsync(x => x.Title == request.Title && x.Author == request.Author &&
                x.Publisher == request.Publisher && x.Edition == request.Edition, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Book '{request.Title}' with author '{request.Author}' and publisher '{request.Publisher}' and edition '{request.Edition}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Book
        {
            Title = request.Title,
            Author = request.Author,
            Publisher = request.Publisher,
            Edition = request.Edition,
            Translator = request.Translator,
            Isbn = request.Isbn,
            Price = request.Price,
            PurchasedDate = request.PurchasedDate.HasValue ? request.PurchasedDate.Value.ToDateOnly() : default,
            TotalOfPages = request.TotalOfPages,
            Year = request.Year,
            Local = request.Local,
            SizeX = request.SizeX,
            SizeY = request.SizeY,
            SizeZ = request.SizeZ,
        };
        await database.Books.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddBookResponse(entry.BookId));
    }

    // Validations
    public class Validator : AbstractValidator<AddBookRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Title)
                .MinimumLength(3)
                .MaximumLength(255);

            RuleFor(x => x.Author)
                .MinimumLength(3)
                .MaximumLength(255);
        }
    }
}



