namespace Leibniz.Api.Authors.Endpoints;
public class AddAuthorEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-author", Handle)
        .Produces<AddAuthorResponse>()
        .WithSummary("Add a new author into the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record AddAuthorRequest(int Type, string Name, string Content);
    public record AddAuthorResponse(long AuthorId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddAuthorRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Authors.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Author '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Author
        {
            Name = request.Name,
            Content = request.Content,
        };
        await database.Authors.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddAuthorResponse(entry.AuthorId));
    }

    // Validations
    public class Validator : AbstractValidator<AddAuthorRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}



