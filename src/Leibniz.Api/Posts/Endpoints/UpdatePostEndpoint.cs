namespace Leibniz.Api.Posts.Endpoints;
public class UpdatePostEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-post", Handle)
        .Produces<UpdatePostResponse>()
        .WithSummary("Update an existing post in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdatePostRequest(long PostId, string Title, string Content, string Author, long? BookId, short? Page, string Reference);
    public record UpdatePostResponse(long PostId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdatePostRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdatePostRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Posts.AnyAsync(x => x.Title == request.Title && x.Author == request.Author && x.PostId != request.PostId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Post '{request.Title}' with name '{request.Author}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Posts.SingleAsync(x => x.PostId == request.PostId, cancellationToken);
        entry.Title = request.Title;
        entry.Content = request.Content;
        entry.Author = request.Author;
        entry.BookId = request.BookId;
        entry.Page = request.Page;
        entry.Reference = request.Reference;
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdatePostResponse(entry.PostId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdatePostRequest>
    {
        public Validator()
        {
            RuleFor(x => x.PostId)
                .GreaterThan(0);
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





