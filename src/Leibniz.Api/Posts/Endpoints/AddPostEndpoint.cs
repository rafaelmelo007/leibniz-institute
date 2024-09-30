namespace Leibniz.Api.Posts.Endpoints;
public class AddPostEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-post", Handle)
        .Produces<AddPostResponse>()
        .WithSummary("Add a new post into the database");

    // Request / Response
    public record AddPostRequest(string Title, string Content, string Author, long? BookId, short? Page, string Reference);
    public record AddPostResponse(long PostId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddPostRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddPostRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Posts.AnyAsync(x => x.Title == request.Title && x.Author == request.Author, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Post '{request.Title}' with author '{request.Author}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Post
        {
            Title = request.Title,
            Content = request.Content,
            Author = request.Author,
            BookId = request.BookId,
            Page = request.Page,
            Reference = request.Reference,
        };
        await database.Posts.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddPostResponse(entry.PostId));
    }

    // Validations
    public class Validator : AbstractValidator<AddPostRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Title)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
            RuleFor(x => x.Author)
                .MinimumLength(3);
        }
    }
}




