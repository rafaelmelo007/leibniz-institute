namespace Leibniz.Api.Authors.Endpoints;
public class GetAuthorEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-author", Handle)
        .Produces<GetAuthorResponse>()
        .WithSummary("Retrieve an author from database");

    // Request / Response
    public record GetAuthorRequest(long AuthorId);
    public record GetAuthorResponse(Author Author);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetAuthorRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var author = await database.Authors.FindAsync(request.AuthorId);
        return TypedResults.Ok(new GetAuthorResponse(author));
    }

    // Validations
    public class Validator : AbstractValidator<GetAuthorRequest>
    {
        public Validator()
        {
            RuleFor(x => x.AuthorId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


