namespace Leibniz.Api.Links.Endpoints;
public class AddLinkEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-link", Handle)
        .Produces<AddLinkResponse>()
        .WithSummary("Add a new link into the database");

    // Request / Response
    public record AddLinkRequest(string Name, string Content, string Url);
    public record AddLinkResponse(long LinkId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddLinkRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddLinkRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Links.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Link with name '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = new Link
        {
            Name = request.Name,
            Content = request.Content,
            Url = request.Url,
        };
        await database.Links.AddAsync(entry, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new AddLinkResponse(entry.LinkId));
    }

    // Validations
    public class Validator : AbstractValidator<AddLinkRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Url)
                .MinimumLength(3)
                .MaximumLength(255);
        }
    }
}


