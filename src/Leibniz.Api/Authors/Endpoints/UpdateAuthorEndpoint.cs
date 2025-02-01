namespace Leibniz.Api.Authors.Endpoints;
public class UpdateAuthorEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-author", Handle)
        .Produces<UpdateAuthorResponse>()
        .WithSummary("Update an existing author in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdateAuthorRequest(long AuthorId, string Name, string Content);
    public record UpdateAuthorResponse(long AuthorId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] Validator validator,
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [FromBody] UpdateAuthorRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Authors.AnyAsync(x => x.Name == request.Name && x.AuthorId != request.AuthorId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Author '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Authors.SingleAsync(x => x.AuthorId == request.AuthorId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateAuthorResponse(entry.AuthorId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateAuthorRequest>
    {
        public Validator()
        {
            RuleFor(x => x.AuthorId)
                .GreaterThan(0);
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}





