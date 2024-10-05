namespace Leibniz.Api.Books.Endpoints;
public class UpdateBookEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-book", Handle)
        .Produces<UpdateBookResponse>()
        .WithSummary("Update an existing book in the database");

    // Request / Response
    public record UpdateBookRequest(long BookId, string Title, string Author,
        string? Content, string? Publisher, short? Edition, string? Isbn,
        short? TotalOfPages, decimal? Price, DateOnly? PurchasedDate,
        string? Translator, short? Year, string? Local,
        decimal? SizeX, decimal? SizeY, decimal? SizeZ);
    public record UpdateBookResponse(bool Changed);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdateBookRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdateBookRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Books.AnyAsync(x => x.Title == request.Title && x.Author == request.Author &&
                x.Publisher == request.Publisher && x.Edition == request.Edition && x.BookId != request.BookId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Book '{request.Title}' with author '{request.Author}' and publisher '{request.Publisher}' and edition '{request.Edition}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Books.SingleAsync(x => x.BookId == request.BookId, cancellationToken);
        entry.Title = request.Title;
        entry.Author = request.Author;
        entry.Content = request.Content;
        entry.Publisher = request.Publisher;
        entry.Edition = request.Edition;
        entry.Translator = request.Translator;
        entry.Isbn = request.Isbn;
        entry.Price = request.Price;
        entry.PurchasedDate = request.PurchasedDate != DateOnly.MinValue ? request.PurchasedDate : default;
        entry.TotalOfPages = request.TotalOfPages;
        entry.Year = request.Year;
        entry.Local = request.Local;
        entry.SizeX = request.SizeX;
        entry.SizeY = request.SizeY;
        entry.SizeZ = request.SizeZ;

        var changed = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new UpdateBookResponse(changed));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateBookRequest>
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





