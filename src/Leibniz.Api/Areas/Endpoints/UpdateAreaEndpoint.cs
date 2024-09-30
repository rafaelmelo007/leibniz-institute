namespace Leibniz.Api.Areas.Endpoints;
public class UpdateAreaEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/update-area", Handle)
        .Produces<UpdateAreaResponse>()
        .WithSummary("Update an existing area in the database");

    // Request / Response
    public record UpdateAreaRequest(long AreaId, string Name, string Content);
    public record UpdateAreaResponse(long AreaId);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] Validator validator,
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [FromBody] UpdateAreaRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var any = await database.Areas.AnyAsync(x => x.Name == request.Name && x.AreaId != request.AreaId, cancellationToken);
        if (any)
        {
            notifications.AddNotification($"Area '{request.Name}' already exists");
            return notifications.ToBadRequest();
        }

        var entry = await database.Areas.SingleAsync(x => x.AreaId == request.AreaId, cancellationToken);
        entry.Name = request.Name;
        entry.Content = request.Content;

        await database.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new UpdateAreaResponse(entry.AreaId));
    }

    // Validations
    public class Validator : AbstractValidator<UpdateAreaRequest>
    {
        public Validator()
        {
            RuleFor(x => x.AreaId)
                .GreaterThan(0);
            RuleFor(x => x.Name)
                .MinimumLength(3)
                .MaximumLength(255);
            RuleFor(x => x.Content)
                .MinimumLength(3);
        }
    }
}





