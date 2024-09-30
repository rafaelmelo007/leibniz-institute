using Leibniz.Api.Common;

namespace Leibniz.Api.Books.Endpoints;
public class GetBookEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-book", Handle)
        .Produces<GetBookResponse>()
        .WithSummary("Retrieve a book from database");

    // Request / Response
    public record GetBookRequest(long BookId);
    public record GetBookResponse(Book Book);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetBookRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var book = await database.Books.FindAsync(request.BookId);
        return TypedResults.Ok(new GetBookResponse(book));
    }

    // Validations
    public class Validator : AbstractValidator<GetBookRequest>
    {
        public Validator()
        {
            RuleFor(x => x.BookId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


