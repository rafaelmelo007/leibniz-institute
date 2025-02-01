namespace Leibniz.Api.Links.Endpoints;
public class UpdateLinkEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-link", Handle)
        .Produces<UpdateLinkResponse>()
        .WithSummary("Update an existing link in the database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record UpdateLinkRequest(long LinkId, string Name, string Content, string Url);
    public record UpdateLinkResponse(long LinkId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<UpdateLinkRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] UpdateLinkRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Links.AnyAsync(x => x.Name == request.Name && x.LinkId != request.LinkId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Link with name '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Links.SingleAsync(x => x.LinkId == request.LinkId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;
        entry.Url = request.Url;

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateLinkResponse(entry.LinkId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateLinkRequest>
    {
        public Validator()
        {
            RuleFor(x => x.LinkId)
                .GreaterThan(0);

            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Url)
                .MinimumLength(3)
                .MaximumLength(255);
        }
    }
}


